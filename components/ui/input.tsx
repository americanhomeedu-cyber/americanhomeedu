import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

/** Brand text input — mirrors the design's .inp field (h48, 1.5px line, green focus ring). */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-sm border-[1.5px] border-line bg-paper px-3.5 text-[15px] text-ink transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-mute focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/10 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
