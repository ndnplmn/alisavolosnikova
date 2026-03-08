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
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      email: fd.get('email'),
      projectType: type,
      message: fd.get('message'),
      printName: defaultPrintName,
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => setSubmitted(true),
      })
    } catch {
      setError('Network error. Please check your connection and try again.')
    }
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
        <label htmlFor="contact-name" className="block font-sans text-[9px] tracking-extreme text-muted mb-2">NAME</label>
        <input id="contact-name" name="name" required className="w-full bg-transparent border-0 border-b border-text-light/20 pb-2 font-sans text-sm text-text-light focus:outline-none focus:border-text-light transition-colors" />
      </div>
      <div className="mb-8">
        <label htmlFor="contact-email" className="block font-sans text-[9px] tracking-extreme text-muted mb-2">EMAIL</label>
        <input id="contact-email" name="email" type="email" required className="w-full bg-transparent border-0 border-b border-text-light/20 pb-2 font-sans text-sm text-text-light focus:outline-none focus:border-text-light transition-colors" />
      </div>
      <fieldset className="mb-8 border-0 p-0 m-0">
        <legend className="block font-sans text-[9px] tracking-extreme text-muted mb-3">TYPE OF PROJECT</legend>
        <div className="flex gap-4 flex-wrap">
          {PROJECT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`font-sans text-[9px] tracking-extreme transition-colors ${type === t ? 'text-text-light underline' : 'text-muted hover:text-text-light'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mb-12">
        <label htmlFor="contact-message" className="block font-sans text-[9px] tracking-extreme text-muted mb-2">MESSAGE</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          defaultValue={defaultPrintName ? `I'm interested in "${defaultPrintName}"` : ''}
          className="w-full bg-transparent border-0 border-b border-text-light/20 pb-2 font-sans text-sm text-text-light focus:outline-none focus:border-text-light transition-colors resize-none"
        />
      </div>
      {error && (
        <p className="font-sans text-[9px] text-red-400 mb-4" role="alert">{error}</p>
      )}
      <CTAButton type="submit">
        {loading ? 'SENDING...' : 'SEND MESSAGE'}
      </CTAButton>
    </form>
  )
}
