'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'

export type ViewMode = 'GRID' | 'LIST'

type ViewModeCtx = { viewMode: ViewMode; setViewMode: (v: ViewMode) => void }

const Ctx = createContext<ViewModeCtx>({ viewMode: 'GRID', setViewMode: () => {} })

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST')
  return <Ctx.Provider value={{ viewMode, setViewMode }}>{children}</Ctx.Provider>
}

export function useViewMode() { return useContext(Ctx) }
