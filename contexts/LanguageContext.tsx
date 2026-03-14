'use client'
import { createContext, useContext, useState, useRef, type ReactNode } from 'react'

export type Lang = 'en' | 'ru'

type LangCtx = {
  lang:    Lang
  langRef: React.MutableRefObject<Lang>
  toggle:  () => void
}

const Ctx = createContext<LangCtx>({
  lang:    'en',
  langRef: { current: 'en' },
  toggle:  () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const langRef = useRef<Lang>('en')

  const toggle = () => {
    const next = langRef.current === 'en' ? 'ru' : 'en'
    langRef.current = next
    setLang(next)
  }

  return <Ctx.Provider value={{ lang, langRef, toggle }}>{children}</Ctx.Provider>
}

export function useLang() { return useContext(Ctx) }
