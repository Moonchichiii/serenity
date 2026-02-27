import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      children,
      disabled,
      type,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        disabled={disabled}
        aria-disabled={disabled ? 'true' : undefined}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain',
          'disabled:pointer-events-none disabled:opacity-50',
          'rounded-2xl',
          'motion-reduce:transition-none motion-reduce:transform-none',

          // Variant styles
          variant === 'default' && [
            'bg-sage-700 text-porcelain border-2 border-sage-700',
            'hover:bg-sage-800 hover:border-sage-800 hover:shadow-glow-sage hover:-translate-y-0.5',
            'active:translate-y-0',
          ],
          variant === 'secondary' && [
            'bg-transparent text-sage-700 border-2 border-sage-300',
            'hover:bg-sage-50 hover:border-sage-500 hover:-translate-y-0.5',
            'active:translate-y-0',
          ],
          variant === 'ghost' && [
            'text-charcoal-light',
            'hover:bg-warm-grey-100 hover:text-charcoal',
          ],
          variant === 'outline' && [
            'border-2 border-warm-grey-200 bg-transparent text-charcoal',
            'hover:bg-warm-grey-100 hover:border-warm-grey-300',
            'active:bg-warm-grey-200',
          ],

          // Size styles
          size === 'sm' && 'h-9 px-4 text-sm',
          size === 'md' && 'h-10 px-5 text-sm',
          size === 'lg' && 'h-12 px-7 text-base',

          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
