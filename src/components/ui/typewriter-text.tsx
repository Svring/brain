"use client";

import * as React from "react";
import { useEffect, useState } from "react";

export interface TypewriterProps {
	text: string | string[];
	speed?: number;
	cursor?: string;
	loop?: boolean;
	deleteSpeed?: number;
	delay?: number;
	className?: string;
	onSentenceComplete?: (sentence: string) => void;
	onTextChange?: (
		currentText: string,
		fullCurrentSentence: string,
		isDeleting: boolean,
	) => void;
	onDeleteStart?: () => void;
}

export function Typewriter({
	text,
	speed = 100,
	cursor = "|",
	loop = false,
	deleteSpeed = 50,
	delay = 1500,
	className,
	//三种状态——回调
	onSentenceComplete,
	onTextChange,
	onDeleteStart,
}: TypewriterProps) {
	const [displayText, setDisplayText] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);
	const [textArrayIndex, setTextArrayIndex] = useState(0);
	const [isTypingComplete, setIsTypingComplete] = useState(false);
	const deleteTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	// Validate and process input text
	const textArray = Array.isArray(text) ? text : [text];
	const currentText = textArray[textArrayIndex] || "";

	useEffect(() => {
		if (!currentText) return;

		const timeout = setTimeout(
			() => {
				if (!isDeleting) {
					if (currentIndex < currentText.length) {
						setDisplayText((prev) => prev + currentText[currentIndex]);
						setCurrentIndex((prev) => prev + 1);
						setIsTypingComplete(false);
					} else {
						// Sentence is complete
						setIsTypingComplete(true);
						if (onSentenceComplete) {
							onSentenceComplete(currentText);
						}
						if (loop) {
							if (deleteTimeoutRef.current) {
								clearTimeout(deleteTimeoutRef.current);
							}
							deleteTimeoutRef.current = setTimeout(() => {
								if (onDeleteStart) {
									onDeleteStart();
								}
								setIsDeleting(true);
							}, delay);
						}
					}
				} else {
					if (displayText.length > 0) {
						setDisplayText((prev) => prev.slice(0, -1));
					} else {
						setIsDeleting(false);
						setCurrentIndex(0);
						setTextArrayIndex((prev) => (prev + 1) % textArray.length);
					}
				}
			},
			isDeleting ? deleteSpeed : speed,
		);

		return () => clearTimeout(timeout);
	}, [
		currentIndex,
		isDeleting,
		currentText,
		loop,
		speed,
		deleteSpeed,
		delay,
		displayText,
		text,
		onSentenceComplete,
		onTextChange,
		onDeleteStart,
	]);

	// Call onTextChange whenever displayText, currentText, or isDeleting changes
	useEffect(() => {
		if (onTextChange) {
			onTextChange(displayText, currentText, isDeleting);
		}
	}, [displayText, currentText, isDeleting, onTextChange]);

	useEffect(() => {
		return () => {
			if (deleteTimeoutRef.current) {
				clearTimeout(deleteTimeoutRef.current);
			}
		};
	}, []);

	return (
		<span className={className}>
			{displayText}
			<span className="animate-pulse">{cursor}</span>
		</span>
	);
}
