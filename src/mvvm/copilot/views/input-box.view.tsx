"use client";

import { SendHorizonal } from "lucide-react";
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { Typewriter } from "@/components/ui/typewriter-text";

const cn = (...classes: (string | undefined | null | false)[]) =>
	classes.filter(Boolean).join(" ");

interface InputBoxProps {
	className?: string;
	disabled?: boolean;
	isLoading?: boolean;
	showTypewriter?: boolean;
	exhibitionTexts?: string[];
	value: string;
	hasContent: boolean;
	placeholder?: string;
	onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	onFocus: () => void;
	onBlur: () => void;
	onCompositionStart: () => void;
	onCompositionEnd: () => void;
	onSubmit: () => void;
	onStop: () => void;
	textareaRef: (node: HTMLTextAreaElement | null) => void;
}

export const InputBoxView = React.forwardRef<HTMLDivElement, InputBoxProps>(
	(props, ref) => {
		const {
			className,
			disabled = false,
			isLoading = false,
			showTypewriter = false,
			exhibitionTexts = [],
			value,
			hasContent,
			placeholder,
			onInputChange,
			onKeyDown,
			onFocus,
			onBlur,
			onCompositionStart,
			onCompositionEnd,
			onSubmit,
			onStop,
			textareaRef,
		} = props;

		return (
			<div
				className={cn(
					"rounded-lg border bg-background-secondary p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 focus-within:border-border-primary flex flex-col",
					isLoading && "border-border-primary animate-shimmer-border",
					className,
				)}
				ref={ref}
			>
				<div className="flex-1 relative">
					<textarea
						className="flex min-h-[44px] w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={disabled}
						placeholder={placeholder}
						onChange={onInputChange}
						onKeyDown={onKeyDown}
						onCompositionStart={onCompositionStart}
						onCompositionEnd={onCompositionEnd}
						onFocus={onFocus}
						onBlur={onBlur}
						ref={textareaRef}
						value={value}
						rows={1}
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

				<div className="flex items-end justify-end gap-2 p-0 mt-auto">
					<button
						className={cn(
							"h-9 w-9 rounded-lg transition-all duration-100 inline-flex items-center justify-center font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border",
							isLoading || hasContent
								? "bg-foreground text-background-secondary hover:bg-foreground/80 cursor-pointer"
								: "bg-transparent cursor-not-allowed text-foreground",
						)}
						disabled={isLoading ? false : !hasContent}
						onClick={isLoading ? onStop : onSubmit}
						type="button"
					>
						{isLoading ? (
							<Spinner className="h-4 w-4" />
						) : (
							<SendHorizonal className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>
		);
	},
);
InputBoxView.displayName = "InputBox";
