'use client'
interface Props { email: string }

export function CopyButton({ email }: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // clipboard API not available
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="font-sans text-sm text-text-light hover:opacity-70 transition-opacity"
      data-cursor="link"
      aria-label={`Copy email address: ${email}`}
    >
      {email} →
    </button>
  )
}
