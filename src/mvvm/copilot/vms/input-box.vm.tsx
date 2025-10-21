"use client";

import React from "react";
import { InputBoxView } from "../views/input-box.view";

interface InputBoxVMProps {
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
	value?: string;
	onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const InputBox = React.forwardRef<HTMLDivElement, InputBoxVMProps>(
	(props, ref) => {
		const {
			onSend = () => {},
			onStop = () => {},
			isLoading = false,
			placeholder,
			className,
			textareaRef,
			autoFocus = false,
			disableInput = false,
			disableSend = false,
			exhibition = false,
			value,
			onInputChange,
		} = props;

		const [input, setInput] = React.useState("");
		const [isFocused, setIsFocused] = React.useState(false);
		const [showTypewriter, setShowTypewriter] = React.useState(false);
		const [isComposing, setIsComposing] = React.useState(false);
		const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
		const prevLoading = React.useRef(isLoading);

		// Use controlled input if value and onInputChange are provided
		const isControlled = value !== undefined && onInputChange !== undefined;
		const currentValue = isControlled ? value : input;

		// Initialize input with placeholder if not controlled and no initial value
		React.useEffect(() => {
			if (!isControlled && !input && placeholder) {
				setInput(placeholder);
			}
		}, [isControlled, input, placeholder]);

		const exhibitionTexts = [
			"Deploy n8n from app store.",
			"Set up a development environment for a next.js project.",
			"Deploy nginx from dockerhub.",
		];

		// Auto-resize textarea on input change
		React.useEffect(() => {
			if (!internalTextareaRef.current) return;
			const textarea = internalTextareaRef.current;
			textarea.style.height = "auto";
			textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
		});
		
		// Sync textarea height when input changes from outside
		React.useEffect(() => {
			if (internalTextareaRef.current && currentValue === "") {
				internalTextareaRef.current.style.height = "auto";
			}
		}, [currentValue]);

		// Focus when loading finishes
		React.useEffect(() => {
			if (prevLoading.current && !isLoading) {
				internalTextareaRef.current?.focus();
			}
			prevLoading.current = isLoading;
		}, [isLoading]);

		// Auto focus
		React.useEffect(() => {
			if (autoFocus) {
				internalTextareaRef.current?.focus();
			}
		}, [autoFocus]);

		// Typewriter effect - only show if no placeholder is provided
		React.useEffect(() => {
			if (exhibition && !currentValue.trim() && !isFocused && !placeholder) {
				const timer = setTimeout(() => setShowTypewriter(true), 1500);
				return () => clearTimeout(timer);
			}
			setShowTypewriter(false);
		}, [exhibition, currentValue, isFocused, placeholder]);

		// Global keydown handler
		React.useEffect(() => {
			const handleGlobalKeydown = (event: KeyboardEvent) => {
				if (disableInput) return;

				const target = event.target as HTMLElement | null;
				if (target) {
					const tagName = target.tagName;
					const isEditable = (target as HTMLElement & { isContentEditable?: boolean }).isContentEditable === true;
					if (tagName === "INPUT" || tagName === "TEXTAREA" || isEditable) {
						return;
					}
				}

				if (event.metaKey || event.ctrlKey || event.altKey) return;
				if (event.key.length !== 1) return;

				internalTextareaRef.current?.focus();
				if (isControlled) {
					// For controlled input, we need to simulate the change event
					const syntheticEvent = {
						target: { value: `${currentValue}${event.key}` }
					} as React.ChangeEvent<HTMLTextAreaElement>;
					onInputChange(syntheticEvent);
				} else {
					setInput((prev) => `${prev}${event.key}`);
				}
				event.preventDefault();
			};

			window.addEventListener("keydown", handleGlobalKeydown);
			return () => window.removeEventListener("keydown", handleGlobalKeydown);
		}, [disableInput, isControlled, currentValue, onInputChange]);

		const handleSubmit = React.useCallback(() => {
			const liveText = (internalTextareaRef.current?.value ?? currentValue).trim();
			if (liveText && !disableSend) {
				onSend(liveText);
				if (!isControlled) {
					setInput("");
				}
				if (internalTextareaRef.current) {
					internalTextareaRef.current.value = "";
					internalTextareaRef.current.style.height = "auto";
				}
			}
		}, [currentValue, onSend, disableSend, isControlled]);

		const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey && !isComposing) {
				e.preventDefault();
				handleSubmit();
			}
			if (e.key === "Escape") {
				internalTextareaRef.current?.blur();
			}
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			if (isControlled) {
				onInputChange(e);
			} else {
				setInput(e.target.value);
			}
		};

		const handleFocus = () => setIsFocused(true);
		const handleBlur = () => setIsFocused(false);
		const handleCompositionStart = () => setIsComposing(true);
		const handleCompositionEnd = () => setIsComposing(false);

		const handleTextareaRef = (node: HTMLTextAreaElement | null) => {
			internalTextareaRef.current = node;
			if (typeof textareaRef === "function") textareaRef(node);
			else if (textareaRef)
				(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
		};

		const hasContent = currentValue.trim() !== "";

		return (
			<InputBoxView
				ref={ref}
				className={className}
				disabled={disableInput}
				isLoading={isLoading}
				showTypewriter={showTypewriter}
				exhibitionTexts={placeholder ? [] : exhibitionTexts}
				value={currentValue}
				hasContent={hasContent}
				placeholder={placeholder}
				onInputChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onCompositionStart={handleCompositionStart}
				onCompositionEnd={handleCompositionEnd}
				onSubmit={handleSubmit}
				onStop={onStop}
				textareaRef={handleTextareaRef}
			/>
		);
	}
);
InputBoxView.displayName = "InputBoxVM";
