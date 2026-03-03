'use client'

import { useState, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppDraftBoxProps {
  draft: string
  onDraftChange: (text: string) => void
  onMarkSent?: () => void
  isAIGenerated?: boolean
  teacherPhone?: string | null
}

export function WhatsAppDraftBox({
  draft,
  onDraftChange,
  onMarkSent,
  isAIGenerated = false,
  teacherPhone,
}: WhatsAppDraftBoxProps) {
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleCopy() {
    if (!draft) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Keep "Copied!" state visible for 5 seconds — UP field condition UX rule
      timeoutRef.current = setTimeout(() => setCopied(false), 5000)
    } catch {
      // Fallback for browsers that block clipboard
      const el = document.createElement('textarea')
      el.value = draft
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      timeoutRef.current = setTimeout(() => setCopied(false), 5000)
    }
  }

  function handleMarkSent() {
    setSent(true)
    onMarkSent?.()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">WhatsApp summary</span>
          {isAIGenerated && (
            <Badge variant="outline" className="text-[10px] gap-1 border-amber-300 text-amber-700 bg-amber-50">
              <AlertTriangle className="h-2.5 w-2.5" />
              AI draft — review carefully
            </Badge>
          )}
        </div>
        {sent && (
          <Badge variant="outline" className="text-[10px] border-green-300 text-green-700 bg-green-50">
            Marked sent
          </Badge>
        )}
      </div>

      <Textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder="Summary will appear here after call ends…"
        className="min-h-[120px] font-[var(--font-devanagari),Arial,sans-serif]"
        lang="hi"
        dir="auto"
        rows={6}
      />

      {isAIGenerated && (
        <p className="text-xs text-muted-foreground">
          Review and edit before sending. AI-generated text may have errors.
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant={copied ? 'default' : 'outline'}
          size="sm"
          onClick={handleCopy}
          disabled={!draft}
          className={cn('gap-2 flex-1', copied && 'bg-green-600 hover:bg-green-700')}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied! Open WhatsApp and paste
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy message
            </>
          )}
        </Button>

        {!sent && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMarkSent}
            disabled={!draft}
            className="text-muted-foreground"
          >
            Mark sent
          </Button>
        )}
      </div>

      {teacherPhone && (
        <p className="text-xs text-muted-foreground">
          Teacher phone: <span className="font-mono">{teacherPhone}</span>
        </p>
      )}
    </div>
  )
}
