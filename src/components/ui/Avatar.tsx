import Image from 'next/image'

import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeStyles: Record<Size, string> = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
}

const sizePx: Record<Size, number> = { sm: 28, md: 36, lg: 48 }

type AvatarProps = {
  name: string
  image?: string | null
  size?: Size
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ name, image, size = 'md', className }: AvatarProps) {
  const px = sizePx[size]

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)]',
        'bg-[var(--accent-dim)] font-semibold text-[var(--accent-light)]',
        sizeStyles[size],
        className
      )}
    >
      {image ? (
        <Image src={image} alt={name} width={px} height={px} className="object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
