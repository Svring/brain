'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-surface-200/10 text-foreground-light ring-surface-200',
        warning: 'bg-warning/10 text-warning-600 ring-warning/30',
        success: 'bg-brand/10 text-brand-600 ring-brand/30',
        destructive: 'bg-destructive/10 text-destructive-600 ring-destructive/30',
        brand: 'bg-brand/10 text-brand-600 ring-brand/30',
        secondary: 'bg-secondary/10 text-secondary-foreground ring-secondary/30',
        outline: 'bg-background text-foreground-light ring-border',
      },
      size: {
        small: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-sm',
        large: 'px-3 py-1 text-sm',
      },
      dot: {
        true: 'pl-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  dotColor?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, dotColor, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-2 w-2 rounded-full',
              dotColor ? dotColor : variant === 'outline' ? 'bg-foreground' : 'bg-current'
            )}
          />
        )}
        {icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }