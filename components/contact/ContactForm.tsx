// components/contact/ContactForm.tsx
'use client'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { CTAButton } from '@/components/ui/CTAButton'

const PROJECT_TYPES = ['COMMISSIONED', 'EDITORIAL', 'EXHIBITION', 'OTHER']

interface Props { defaultPrintName?: string }

export function ContactForm({ defaultPrintName }: Props) {
  const [type, setType] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      email: fd.get('email'),
      projectType: type,
      message: fd.get('message'),
      printName: defaultPrintName,
    }
    await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.out', onComplete: () => setSubmitted(true) })
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-5xl mb-6">Thank you.</p>
        <p className="font-sans text-sm text-muted mb-12">Alisa will be in touch soon.</p>
        <CTAButton href="/work">WHILE YOU WAIT — EXPLORE THE WORK</CTAButton>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="mb-8">
        <label className="block font-sans text-[9px] tracking-extreme text-muted mb-2">NAME</label>
        <input name="name" required className="w-full bg-transparent border-0 border-b border-text-light/20 pb-2 font-sans text-sm text-text-light focus:outline-none focus:border-text-light transition-colors" />
      </div>
      <div className="mb-8">
        <label className="block font-sans text-[9px] tracking-extreme text-muted mb-2">EMAIL</label>
        <input name="email" type="email" required className="w-full bg-transparent border-0 border-b border-text-light/20 pb-2 font-sans text-sm text-text-light focus:outline-none focus:border-text-light transition-colors" />
      </div>
      <div className="mb-8">
        <label className="block font-sans text-[9px] tracking-extreme text-muted mb-3">TYPE OF PROJECT</label>
        <div className="flex gap-4 flex-wrap">
          {PROJECT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`font-sans text-[9px] tracking-extreme transition-colors ${type === t ? 'text-text-light underline' : 'text-muted hover:text-text-light'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-12">
        <label className="block font-sans text-[9px] tracking-extreme text-muted mb-2">MESSAGE</label>
        <textarea
          name="message"
          required
          rows={4}
          defaultValue={defaultPrintName ? `I'm interested in "${defaultPrintName}"` : ''}
          className="w-full bg-transparent border-0 border-b border-text-light/20 pb-2 font-sans text-sm text-text-light focus:outline-none focus:border-text-light transition-colors resize-none"
        />
      </div>
      <CTAButton type="submit">
        {loading ? 'SENDING...' : 'SEND MESSAGE'}
      </CTAButton>
    </form>
  )
}
