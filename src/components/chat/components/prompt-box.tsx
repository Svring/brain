"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, SendHorizonal, Square } from "lucide-react";
import React from "react";
import { useDebounce } from "@reactuses/core";
import { Typewriter } from "@/components/ui/typewriter-text";
// import { useProjectCreateDialog } from "@/hooks/brain/use-project-create-dialog";
import { Spinner } from "@/components/ui/spinner";

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// Textarea Component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[44px] w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      rows={1}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    className={cn(
      "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 animate-in overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md data-[state=closed]:animate-out",
      className
    )}
    ref={ref}
    sideOffset={sideOffset}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white hover:bg-white/80 text-black",
      outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
      ghost: "bg-transparent hover:bg-[#3A3A40]",
    };
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full aspect-square",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// PromptInput Context and Components
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});
function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context)
    throw new Error("usePromptInput must be used within a PromptInput");
  return context;
}

interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            className={cn(
              "rounded-xl border border-[#444444] bg-background-secondary p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 focus-within:border-border-primary flex flex-col",
              isLoading &&
                "border border-border-primary animate-shimmer-border",
              className
            )}
            ref={ref}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = "PromptInput";

interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
}
const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps & React.ComponentProps<typeof Textarea>
>(
  (
    { className, onKeyDown, disableAutosize = false, placeholder, ...props },
    ref
  ) => {
    const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [localValue, setLocalValue] = React.useState(value);
    const [isComposing, setIsComposing] = React.useState(false);
    const debouncedValue = useDebounce(localValue, 100);

    React.useEffect(() => {
      if (disableAutosize || !textareaRef.current) return;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        typeof maxHeight === "number"
          ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
          : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
    }, [localValue, maxHeight, disableAutosize]);

    // Sync debounced local input into the shared context to avoid re-renders on every keystroke
    React.useEffect(() => {
      if (debouncedValue !== value) {
        setValue(debouncedValue);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue, setValue]);

    // When the external value changes (e.g., cleared after send), reflect it locally
    React.useEffect(() => {
      if (value !== localValue) {
        setLocalValue(value);
        // Also update the textarea ref directly for immediate visual feedback
        if (textareaRef.current) {
          textareaRef.current.value = value;
          // Reset height when clearing
          if (value === "") {
            textareaRef.current.style.height = "auto";
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Add effect to sync when the textarea is manually cleared
    React.useEffect(() => {
      if (
        textareaRef.current &&
        textareaRef.current.value === "" &&
        localValue !== ""
      ) {
        setLocalValue("");
      }
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isComposing) {
        e.preventDefault();
        // Immediately sync the current local value before submitting
        if (localValue !== value) {
          setValue(localValue);
        }
        onSubmit?.();
      }
      if (e.key === "Escape") {
        textareaRef.current?.blur();
      }
      onKeyDown?.(e);
    };

    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

    return (
      <Textarea
        className={cn("", className)}
        disabled={disabled}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        ref={(node) => {
          textareaRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (
              ref as React.MutableRefObject<HTMLTextAreaElement | null>
            ).current = node;
        }}
        value={localValue}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;
const PromptInputActions: React.FC<PromptInputActionsProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
  tooltip,
  children,
  className,
  side = "bottom",
  ...props
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent className={className} side={side}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

// Main PromptInputBox Component
interface PromptInputBoxProps {
  onSend?: (message: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  autoFocus?: boolean;
  disableInput?: boolean;
  disableSend?: boolean;
  exhibition?: boolean;
}
export const PromptInputBox = React.forwardRef(
  (props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      onSend = () => {},
      onStop = () => {},
      isLoading = false,
      placeholder = "Type your message here...",
      className,
      textareaRef,
      autoFocus = false,
      disableInput = false,
      disableSend = false,
      exhibition = false,
    } = props;

    // const { openDialog, CreateProjectDialog } = useProjectCreateDialog();
    const [input, setInput] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const [showTypewriter, setShowTypewriter] = React.useState(false);
    const promptBoxRef = React.useRef<HTMLDivElement>(null);
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    // For tracking previous loading state
    const prevLoading = React.useRef(isLoading);

    // Exhibition texts for typewriter effect
    const exhibitionTexts = [
      "Deploy affine from app store.",
      "Set up a development environment for a next.js project.",
      "Deploy nginx from dockerhub.",
    ];

    // Focus when loading finishes
    React.useEffect(() => {
      if (prevLoading.current && !isLoading) {
        internalTextareaRef.current?.focus();
      }
      prevLoading.current = isLoading;
    }, [isLoading]);

    // Focus when autoFocus becomes true
    React.useEffect(() => {
      if (autoFocus) {
        internalTextareaRef.current?.focus();
      }
    }, [autoFocus]);

    // Show typewriter with 1s delay when conditions are met
    React.useEffect(() => {
      if (exhibition && !input.trim() && !isFocused) {
        const timer = setTimeout(() => {
          setShowTypewriter(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setShowTypewriter(false);
      }
    }, [exhibition, input, isFocused]);

    // Focus prompt and insert typed character when user starts typing anywhere
    React.useEffect(() => {
      const handleGlobalKeydown = (event: KeyboardEvent) => {
        if (disableInput) return;

        const target = event.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          const isEditable = (target as any).isContentEditable === true;
          if (tagName === "INPUT" || tagName === "TEXTAREA" || isEditable) {
            return;
          }
        }

        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.key.length !== 1) return; // printable characters only

        // Focus the textarea and append the pressed key
        internalTextareaRef.current?.focus();
        setInput((prev) => `${prev}${event.key}`);
        event.preventDefault();
      };

      window.addEventListener("keydown", handleGlobalKeydown);
      return () => window.removeEventListener("keydown", handleGlobalKeydown);
    }, [disableInput]);

    const handleSubmit = React.useCallback(() => {
      const liveText = (internalTextareaRef.current?.value ?? input).trim();
      if (liveText && !disableSend) {
        // Send the message
        onSend(liveText);

        // Clear all state and force immediate UI clearing
        setInput("");

        // Force immediate clearing of the textarea to prevent race conditions
        if (internalTextareaRef.current) {
          internalTextareaRef.current.value = "";
          internalTextareaRef.current.style.height = "auto";
        }
      }
    }, [input, onSend, disableSend]);

    const hasContent = input.trim() !== "";

    return (
      <>
        <PromptInput
          className={cn(
            "w-full border-border shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out",
            className
          )}
          disabled={disableInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onValueChange={setInput}
          ref={ref || promptBoxRef}
          value={input}
        >
          <div className="flex-1 relative">
            <PromptInputTextarea
              placeholder={placeholder}
              className="flex-1"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              ref={(node) => {
                internalTextareaRef.current = node;
                if (typeof textareaRef === "function") textareaRef(node);
                else if (textareaRef)
                  (
                    textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
                  ).current = node;
              }}
            />
            {showTypewriter && (
              <div className="absolute inset-0 pointer-events-none flex items-start px-3 py-2.5">
                <Typewriter
                  text={exhibitionTexts}
                  speed={50}
                  deleteSpeed={50}
                  delay={2000}
                  loop={true}
                  className="text-gray-400"
                />
              </div>
            )}
          </div>

          <PromptInputActions className="flex items-end justify-end gap-2 p-0 mt-auto">
            <PromptInputAction
              tooltip={
                isLoading
                  ? "Stop generation"
                  : hasContent
                  ? "Send message"
                  : "Type a message to send"
              }
            >
              <Button
                className={cn(
                  "h-9 w-9 rounded-lg transition-all duration-100",
                  isLoading || hasContent
                    ? "bg-foreground! text-background-secondary hover:bg-foreground/80 cursor-pointer"
                    : "bg-transparent cursor-not-allowed text-foreground"
                )}
                disabled={disableSend || (!isLoading && !hasContent)}
                onClick={isLoading ? onStop : handleSubmit}
                size="icon"
                variant="outline"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="stop"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Spinner className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>

        {/* <CreateProjectDialog /> */}
      </>
    );
  }
);
PromptInputBox.displayName = "PromptInputBox";
