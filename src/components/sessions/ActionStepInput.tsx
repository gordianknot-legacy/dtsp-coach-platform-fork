'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

export interface ActionStepDraft {
  description: string
  due_date: string
}

interface ActionStepInputProps {
  value: ActionStepDraft[]
  onChange: (steps: ActionStepDraft[]) => void
  maxSteps?: number
}

export function ActionStepInput({ value, onChange, maxSteps = 3 }: ActionStepInputProps) {
  function addStep() {
    if (value.length >= maxSteps) return
    onChange([...value, { description: '', due_date: '' }])
  }

  function removeStep(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function updateStep(index: number, field: keyof ActionStepDraft, val: string) {
    onChange(value.map((step, i) => i === index ? { ...step, [field]: val } : step))
  }

  return (
    <div className="space-y-3">
      <Label>Action steps (max {maxSteps})</Label>

      {value.map((step, index) => (
        <div key={index} className="flex gap-2 sm:gap-3 items-start">
          <div className="flex-1 space-y-1">
            <Input
              placeholder={`Step ${index + 1}: What will the teacher do?`}
              value={step.description}
              onChange={(e) => updateStep(index, 'description', e.target.value)}
            />
            <Input
              type="date"
              value={step.due_date}
              onChange={(e) => updateStep(index, 'due_date', e.target.value)}
              className="text-sm"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeStep(index)}
            className="h-9 w-9 text-muted-foreground hover:text-destructive mt-0.5"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {value.length < maxSteps && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add action step
        </Button>
      )}
    </div>
  )
}
