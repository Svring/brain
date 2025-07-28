import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  12
);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
