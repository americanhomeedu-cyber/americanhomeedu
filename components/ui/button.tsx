import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Brand button — pill shape, matches the landing/student CTA system.
 * Variants mirror the design's .btn-* classes.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-bold leading-none transition-[transform,background-color,box-shadow,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        green:
          'bg-green text-white hover:-translate-y-0.5 hover:bg-green-deep hover:shadow-e2',
        gold: 'bg-gold text-[#2a2412] shadow-gold hover:-translate-y-0.5 hover:bg-gold-deep',
        outline:
          'border-[1.5px] border-ink bg-transparent text-ink hover:-translate-y-0.5 hover:bg-ink hover:text-cream',
        light:
          'bg-white text-green hover:-translate-y-0.5 hover:shadow-e3',
        ghost: 'bg-transparent text-ink hover:text-green',
        danger: 'bg-error text-white hover:bg-[#9a3030]',
      },
      size: {
        default: 'h-12 px-7 text-[16px]',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-[52px] px-9 text-[17px]',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'green', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
