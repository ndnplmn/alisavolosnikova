import { type ReactNode } from 'react'

interface CornerUIProps {
  topLeft?: ReactNode
  topRight?: ReactNode
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
}

// All corner positions are fixed to viewport edges.
// The photographs own the center. Always.
export function CornerUI({ topLeft, topRight, bottomLeft, bottomRight }: CornerUIProps) {
  const baseClass = 'fixed z-40 font-sans text-[10px] tracking-extreme uppercase pointer-events-none'

  return (
    <>
      {topLeft && (
        <div className={`${baseClass} top-6 left-6 opacity-60`}>
          {topLeft}
        </div>
      )}
      {topRight && (
        <div className={`${baseClass} top-6 right-6 pointer-events-auto`}>
          {topRight}
        </div>
      )}
      {bottomLeft && (
        <div className={`${baseClass} bottom-6 left-6 opacity-60`}>
          {bottomLeft}
        </div>
      )}
      {bottomRight && (
        <div className={`${baseClass} bottom-6 right-6 opacity-60 text-right`}>
          {bottomRight}
        </div>
      )}
    </>
  )
}
