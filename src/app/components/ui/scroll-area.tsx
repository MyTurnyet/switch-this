'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner className="bg-gray-200" />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = 'ScrollArea';

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & { 
    color?: 'default' | 'primary' | 'secondary' 
  }
>(({ className, orientation = 'vertical', color = 'default', ...props }, ref) => {
  const colorClasses = {
    default: 'bg-gray-300 hover:bg-gray-400',
    primary: 'bg-primary-300 hover:bg-primary-400',
    secondary: 'bg-secondary-300 hover:bg-secondary-400',
  };

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        'flex touch-none select-none transition-colors',
        orientation === 'vertical' &&
          'h-full w-2.5 border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' &&
          'h-2.5 border-t border-t-transparent p-[1px]',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb 
        className={cn(
          'relative flex-1 rounded-full transition-colors', 
          colorClasses[color]
        )} 
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
});
ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar }; 