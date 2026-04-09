import { forwardRef, type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends ComponentPropsWithRef<'div'> {
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ hover = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass rounded-2xl p-4',
          hover && 'glass-hover',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
