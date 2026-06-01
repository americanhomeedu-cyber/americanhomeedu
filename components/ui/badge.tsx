import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/** Brand badge — pill tag for statuses (admin tables) and brand labels. */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-sans font-bold leading-none',
  {
    variants: {
      variant: {
        default: 'bg-cream text-green',
        gold: 'bg-gold-soft text-gold-deep',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        error: 'bg-error-soft text-error',
        info: 'bg-info-soft text-info',
        outline: 'border border-line text-ink-soft',
      },
      size: {
        default: 'px-2.5 py-1 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
