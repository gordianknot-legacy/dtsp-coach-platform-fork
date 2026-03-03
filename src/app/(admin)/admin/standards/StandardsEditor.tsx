'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, GripVertical } from 'lucide-react'
import type { RubricDimension, VBAChecklistItem } from '@/lib/supabase/types'

interface StandardsEditorProps {
  cohorts: { id: string; name: string }[]
}

interface Standards {
  reschedule_escalation_threshold: string
  vba_overdue_days: string
  chronic_non_confirmation_count: string
  session_target_monthly: string
  ryg_green_days_threshold: string
  ryg_red_days_threshold: string
}

const DEFAULT_STANDARDS: Standards = {
  reschedule_escalation_threshold: '3',
  vba_overdue_days: '30',
  chronic_non_confirmation_count: '3',
  session_target_monthly: '2',
  ryg_green_days_threshold: '14',
  ryg_red_days_threshold: '21',
}

const DEFAULT_FOCUS_CATEGORIES = ['Literacy', 'Numeracy', 'Relationship', 'Off-script']

export function StandardsEditor({ cohorts }: StandardsEditorProps) {
  const { toast } = useToast()
  const [selectedCohort, setSelectedCohort] = useState('')
  const [standards, setStandards] = useState<Standards>(DEFAULT_STANDARDS)
  const [focusCategories, setFocusCategories] = useState<string[]>(DEFAULT_FOCUS_CATEGORIES)
  const [newCategory, setNewCategory] = useState('')
  const [rubricDimensions, setRubricDimensions] = useState<RubricDimension[]>([])
  const [vbaChecklist, setVbaChecklist] = useState<VBAChecklistItem[]>([])
  const [requiredFields, setRequiredFields] = useState<string[]>(['what_discussed', 'focus_tag'])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!selectedCohort) return
    setLoading(true)
    Promise.all([
      fetch(`/api/admin/standards?cohort_id=${selectedCohort}`).then((r) => r.json()),
      fetch(`/api/admin/standards/templates?cohort_id=${selectedCohort}`).then((r) => r.json()),
    ]).then(([stdData, tplData]) => {
      if (stdData.standards) setStandards({ ...DEFAULT_STANDARDS, ...stdData.standards })
      if (tplData.template) {
        setFocusCategories(tplData.template.focus_categories ?? DEFAULT_FOCUS_CATEGORIES)
        setRubricDimensions(tplData.template.rubric_json ?? [])
        setVbaChecklist(tplData.template.vba_checklist ?? [])
        setRequiredFields(tplData.template.required_fields ?? ['what_discussed', 'focus_tag'])
      }
    }).finally(() => setLoading(false))
  }, [selectedCohort])

  async function saveStandards() {
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/admin/standards', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cohort_id: selectedCohort, standards }),
        }),
        fetch('/api/admin/standards/templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cohort_id: selectedCohort,
            focus_categories: focusCategories,
            rubric_json: rubricDimensions,
            vba_checklist: vbaChecklist,
            required_fields: requiredFields,
          }),
        }),
      ])
      toast({ title: 'Standards saved' })
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function addRubricDimension() {
    const newDim: RubricDimension = {
      id: crypto.randomUUID(),
      label: '',
      scale_min: 1,
      scale_max: 5,
      anchors: { '1': '', '5': '' },
      order: rubricDimensions.length,
    }
    setRubricDimensions([...rubricDimensions, newDim])
  }

  function updateRubricDimension(id: string, updates: Partial<RubricDimension>) {
    setRubricDimensions(rubricDimensions.map((d) => d.id === id ? { ...d, ...updates } : d))
  }

  function removeRubricDimension(id: string) {
    setRubricDimensions(rubricDimensions.filter((d) => d.id !== id))
  }

  function addChecklistItem() {
    const newItem: VBAChecklistItem = {
      id: crypto.randomUUID(),
      label: '',
      order: vbaChecklist.length,
    }
    setVbaChecklist([...vbaChecklist, newItem])
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Standards & Templates</h1>
          <p className="text-sm text-muted-foreground">Configure rubrics, focus categories, escalation thresholds</p>
        </div>
        {selectedCohort && (
          <Button onClick={saveStandards} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save all'}
          </Button>
        )}
      </div>

      {/* Cohort selector */}
      <div className="space-y-2 max-w-sm">
        <Label>Cohort</Label>
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger><SelectValue placeholder="Select cohort to configure…" /></SelectTrigger>
          <SelectContent>
            {cohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCohort ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Select a cohort to configure its standards
          </CardContent>
        </Card>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Tabs defaultValue="thresholds">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="focus">Focus Categories</TabsTrigger>
            <TabsTrigger value="rubric">Spot-check Rubric</TabsTrigger>
            <TabsTrigger value="vba">VBA Checklist</TabsTrigger>
            <TabsTrigger value="required">Required Fields</TabsTrigger>
          </TabsList>

          {/* THRESHOLDS */}
          <TabsContent value="thresholds" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Escalation & program thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'reschedule_escalation_threshold', label: 'Reschedule escalation threshold', help: 'Auto-escalate after N reschedules in 30 days' },
                  { key: 'vba_overdue_days', label: 'VBA overdue threshold (days)', help: 'Flag VBA overdue after N days' },
                  { key: 'chronic_non_confirmation_count', label: 'Chronic non-confirmation count', help: 'Escalate after N unconfirmed sessions' },
                  { key: 'session_target_monthly', label: 'Monthly session target per teacher', help: 'Expected sessions per teacher per month' },
                  { key: 'ryg_green_days_threshold', label: 'Days without touch → Yellow', help: 'Days since last contact before flagging as Yellow' },
                  { key: 'ryg_red_days_threshold', label: 'Days without touch → Red', help: 'Days since last contact before flagging as Red' },
                ].map(({ key, label, help }) => (
                  <div key={key} className="space-y-1">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        className="w-24"
                        value={standards[key as keyof Standards]}
                        onChange={(e) => setStandards({ ...standards, [key]: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">{help}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOCUS CATEGORIES */}
          <TabsContent value="focus" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Focus categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {focusCategories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={cat} onChange={(e) => setFocusCategories(focusCategories.map((c, j) => j === i ? e.target.value : c))} />
                    <Button
                      type="button" variant="ghost" size="icon"
                      onClick={() => setFocusCategories(focusCategories.filter((_, j) => j !== i))}
                      disabled={focusCategories.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name…"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCategory.trim()) {
                        setFocusCategories([...focusCategories, newCategory.trim()])
                        setNewCategory('')
                      }
                    }}
                  />
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => { if (newCategory.trim()) { setFocusCategories([...focusCategories, newCategory.trim()]); setNewCategory('') }}}
                    className="gap-2 shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RUBRIC */}
          <TabsContent value="rubric" className="mt-4 space-y-3">
            {rubricDimensions.map((dim) => (
              <Card key={dim.id}>
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Dimension name (e.g. Lesson preparation)"
                      value={dim.label}
                      onChange={(e) => updateRubricDimension(dim.id, { label: e.target.value })}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRubricDimension(dim.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Min</Label>
                      <Input type="number" className="w-16" min="1" value={dim.scale_min}
                        onChange={(e) => updateRubricDimension(dim.id, { scale_min: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max</Label>
                      <Input type="number" className="w-16" min="2" value={dim.scale_max}
                        onChange={(e) => updateRubricDimension(dim.id, { scale_max: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Anchor at {dim.scale_min} (lowest)</Label>
                      <Textarea rows={2} placeholder="Describe lowest score…"
                        value={dim.anchors[dim.scale_min.toString()] ?? ''}
                        onChange={(e) => updateRubricDimension(dim.id, { anchors: { ...dim.anchors, [dim.scale_min]: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Anchor at {dim.scale_max} (highest)</Label>
                      <Textarea rows={2} placeholder="Describe highest score…"
                        value={dim.anchors[dim.scale_max.toString()] ?? ''}
                        onChange={(e) => updateRubricDimension(dim.id, { anchors: { ...dim.anchors, [dim.scale_max]: e.target.value } })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addRubricDimension} className="gap-2">
              <Plus className="h-4 w-4" /> Add dimension
            </Button>
          </TabsContent>

          {/* VBA CHECKLIST */}
          <TabsContent value="vba" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">VBA protocol checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vbaChecklist.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      value={item.label}
                      onChange={(e) => setVbaChecklist(vbaChecklist.map((v, j) => j === i ? { ...v, label: e.target.value } : v))}
                      placeholder={`Checklist item ${i + 1}`}
                    />
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => setVbaChecklist(vbaChecklist.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addChecklistItem} className="gap-2">
                  <Plus className="h-4 w-4" /> Add checklist item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REQUIRED FIELDS */}
          <TabsContent value="required" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Required fields before session close</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: 'what_discussed', label: 'What was discussed' },
                  { key: 'what_decided', label: 'What was decided' },
                  { key: 'focus_tag', label: 'Focus tag' },
                  { key: 'action_steps', label: 'At least one action step' },
                  { key: 'duration_mins', label: 'Duration (minutes)' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={requiredFields.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRequiredFields([...requiredFields, key])
                        } else {
                          setRequiredFields(requiredFields.filter((f) => f !== key))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={key} className="text-sm cursor-pointer">{label}</label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
