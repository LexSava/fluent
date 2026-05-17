import React from 'react'

type DivProps = React.HTMLAttributes<HTMLDivElement> & {
  animate?: unknown
  initial?: unknown
  exit?: unknown
  transition?: unknown
  custom?: unknown
  variants?: unknown
  layout?: unknown
}

type SpanProps = React.HTMLAttributes<HTMLSpanElement> & {
  animate?: unknown
  initial?: unknown
  exit?: unknown
  transition?: unknown
  key?: string
}

// eslint-disable-next-line react/display-name
const MotionDiv = React.forwardRef<HTMLDivElement, DivProps>(
  (
    {
      children,
      animate: _a,
      initial: _i,
      exit: _e,
      transition: _t,
      custom: _c,
      variants: _v,
      layout: _l,
      ...rest
    },
    ref
  ) => (
    <div ref={ref} {...rest}>
      {children}
    </div>
  )
)

const MotionSpan = ({
  children,
  animate: _a,
  initial: _i,
  exit: _e,
  transition: _t,
  ...rest
}: SpanProps) => <span {...rest}>{children}</span>

export const motion = { div: MotionDiv, span: MotionSpan }

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>
