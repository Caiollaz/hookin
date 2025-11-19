import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface CopyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  size?: 'sm' | 'md'
}

export function CopyButton({
  value,
  size = 'md',
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const sizeClasses = size === 'sm' ? 'size-6' : 'size-9'
  const iconSize = size === 'sm' ? 'size-3' : 'size-4'

  return (
    <button
      onClick={handleCopy}
      className={twMerge(
        'relative flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 transition-colors',
        'hover:bg-zinc-700 active:outline active:outline-zinc-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
        sizeClasses,
        className,
      )}
      {...props}
    >
      {copied ? (
        <CheckIcon
          className={`${iconSize} text-indigo-400`}
          strokeWidth={2.5}
        />
      ) : (
        <CopyIcon
          className={`${iconSize} hover:cursor-pointer`}
          strokeWidth={2}
        />
      )}
    </button>
  )
}
