import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeMarkdownLinks(inputText: string): string {
  // Regex to match markdown links. It looks for patterns like [text](URL)
  const markdownLinkPattern = /\[([^\]]+)\]\([^\)]+\)/g;
  
  // Replace markdown links with just the text part
  return inputText.replace(markdownLinkPattern, '$1');
}