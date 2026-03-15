'use client'
import { useState } from 'react'
import Image from 'next/image'

interface DisciplineListProps {
  items: string[]
  /** Thumbnail shown on row hover (uses portrait as fallback) */
  thumbnail?: string
}

export function DisciplineList({ items, thumbnail }: DisciplineListProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="border-t border-text-dark/10 px-6 md:px-16 py-10">
      <p
        className="font-sans text-muted mb-8"
        style={{ fontSize: '9px', letterSpacing: '0.22em' }}
      >
        PRACTICE
      </p>

      {items.map((item, i) => (
        <div
          key={item}
          className="relative border-t border-text-dark/10 flex items-center justify-between py-5 cursor-default"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Discipline name */}
          <p
            className="font-serif italic text-text-dark transition-opacity duration-300"
            style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 3rem)',
              fontWeight: 300,
              // Fade siblings when one is hovered
              opacity: hovered !== null && hovered !== i ? 0.25 : 1,
            }}
          >
            {item}
          </p>

          {/* Order index */}
          <span
            className="font-sans text-muted ml-4 shrink-0"
            style={{ fontSize: '9px', letterSpacing: '0.22em' }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>

          {/* Hover thumbnail — slides in from right, hidden on touch devices via CSS */}
          {thumbnail && (
            <div
              className="hidden md:block absolute right-16 top-1/2 overflow-hidden pointer-events-none"
              style={{
                width: '150px',
                height: '105px',
                transform: `translateY(-50%) translateX(${hovered === i ? '0px' : '18px'})`,
                opacity: hovered === i ? 1 : 0,
                transition: 'opacity 0.28s ease, transform 0.28s ease',
              }}
            >
              <Image
                src={thumbnail}
                alt={item}
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      ))}

      {/* Closing rule */}
      <div className="border-t border-text-dark/10" />
    </div>
  )
}
