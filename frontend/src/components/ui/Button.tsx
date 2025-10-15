import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-300',
          'focus-visible:ring-terracotta-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          'rounded-2xl',

          // Variants
          variant === 'default' &&
            'bg-charcoal text-porcelain hover:bg-terracotta-500 hover:shadow-warm',
          variant === 'secondary' && 'bg-sage-200 text-charcoal hover:bg-terracotta-300',
          variant === 'ghost' && 'hover:bg-sage-100 hover:text-charcoal',
          variant === 'outline' &&
            'border-sage-200 hover:bg-sage-100 hover:border-terracotta-300 border-2 bg-transparent',

          // Sizes
          size === 'sm' && 'h-9 px-4 text-sm',
          size === 'md' && 'h-11 px-6 text-base',
          size === 'lg' && 'h-14 px-8 text-lg',

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
