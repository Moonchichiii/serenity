import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, disabled, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        disabled={disabled}
        aria-disabled={disabled ? 'true' : undefined}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'rounded-2xl',
          'motion-reduce:transition-none motion-reduce:transform-none',

          // Variant styles - UPDATED to use sage green for default
          variant === 'default' && [
            'bg-sage-600 text-porcelain',
            'hover:bg-sage-700 hover:shadow-warm hover:-translate-y-0.5',
            'active:translate-y-0'
          ],
          variant === 'secondary' && [
            'bg-sage-100 text-sage-700 border-2 border-sage-300',
            'hover:bg-sage-200 hover:border-sage-500 hover:-translate-y-0.5',
            'active:translate-y-0'
          ],
          variant === 'ghost' && [
            'hover:bg-sage-100 hover:text-charcoal'
          ],
          variant === 'outline' && [
            'border-2 border-sage-200 bg-transparent text-charcoal',
            'hover:bg-sage-100 hover:border-sage-400',
            'active:bg-sage-200'
          ],

          // Size styles
          size === 'sm' && 'h-9 px-4 text-sm',
          size === 'md' && 'h-10 px-5 text-sm',
          size === 'lg' && 'h-11 px-6 text-base',

          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
