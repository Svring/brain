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
		} = props;

		const [input, setInput] = React.useState("");
		const [isFocused, setIsFocused] = React.useState(false);
		const [showTypewriter, setShowTypewriter] = React.useState(false);
		const [isComposing, setIsComposing] = React.useState(false);
		const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
		const prevLoading = React.useRef(isLoading);

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
			if (internalTextareaRef.current && input === "") {
				internalTextareaRef.current.style.height = "auto";
			}
		}, [input]);

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
			if (exhibition && !input.trim() && !isFocused && !placeholder) {
				const timer = setTimeout(() => setShowTypewriter(true), 1500);
				return () => clearTimeout(timer);
			}
			setShowTypewriter(false);
		}, [exhibition, input, isFocused, placeholder]);

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
				setInput((prev) => `${prev}${event.key}`);
				event.preventDefault();
			};

			window.addEventListener("keydown", handleGlobalKeydown);
			return () => window.removeEventListener("keydown", handleGlobalKeydown);
		}, [disableInput]);

		const handleSubmit = React.useCallback(() => {
			const liveText = (internalTextareaRef.current?.value ?? input).trim();
			if (liveText && !disableSend) {
				onSend(liveText);
				setInput("");
				if (internalTextareaRef.current) {
					internalTextareaRef.current.value = "";
					internalTextareaRef.current.style.height = "auto";
				}
			}
		}, [input, onSend, disableSend]);

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
			setInput(e.target.value);
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

		const hasContent = input.trim() !== "";

		return (
			<InputBoxView
				ref={ref}
				className={className}
				disabled={disableInput}
				isLoading={isLoading}
				showTypewriter={showTypewriter}
				exhibitionTexts={placeholder ? [] : exhibitionTexts}
				value={input}
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
