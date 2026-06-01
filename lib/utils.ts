import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * Used by every UI component (shadcn convention).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
