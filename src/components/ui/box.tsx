'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  className?: string
  children?: React.ReactNode
}

const Box = React.forwardRef<HTMLElement, BoxProps>(({ as: Component = 'div', className, children, ...props }, ref) => {
  return (
    <Component ref={ref} className={cn(className)} {...props}>
      {children}
    </Component>
  )
})

Box.displayName = 'Box'

export default Box
