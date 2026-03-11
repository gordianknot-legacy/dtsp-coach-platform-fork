'use client'

import { cn } from '@/lib/utils'

interface FocusTagSelectorProps {
  tags: string[]
  value: string | null
  onChange: (tag: string | null) => void
  disabled?: boolean
}

const TAG_COLORS: Record<string, string> = {
  Literacy: 'bg-blue-100 text-blue-700 border-blue-200 data-[active=true]:bg-blue-600 data-[active=true]:text-white',
  Numeracy: 'bg-purple-100 text-purple-700 border-purple-200 data-[active=true]:bg-purple-600 data-[active=true]:text-white',
  Relationship: 'bg-pink-100 text-pink-700 border-pink-200 data-[active=true]:bg-pink-600 data-[active=true]:text-white',
  'Off-script': 'bg-orange-100 text-orange-700 border-orange-200 data-[active=true]:bg-orange-600 data-[active=true]:text-white',
}

const DEFAULT_COLOR = 'bg-muted text-muted-foreground border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground'

export function FocusTagSelector({ tags, value, onChange, disabled = false }: FocusTagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          data-active={value === tag}
          disabled={disabled}
          onClick={() => onChange(value === tag ? null : tag)}
          className={cn(
            'px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            TAG_COLORS[tag] ?? DEFAULT_COLOR
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
