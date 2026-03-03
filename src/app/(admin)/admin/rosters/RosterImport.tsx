'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Upload, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react'

interface ValidationResult {
  valid: number
  errors: { row: number; field: string; message: string }[]
  warnings: { row: number; field: string; message: string }[]
  preview: Record<string, string>[]
}

interface RosterImportProps {
  cohorts: { id: string; name: string }[]
}

export function RosterImport({ cohorts }: RosterImportProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [cohortId, setCohortId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [importing, setImporting] = useState(false)

  const CSV_TEMPLATE = `name,phone,school_name,udise_code,block_tag,designation,hm_name,hm_phone
Priya Sharma,9876543210,GPS Rampur,09123456789,Block A,Assistant Teacher,Rajesh Kumar,9876543211
Meera Devi,9876543212,GPS Sitapur,09123456790,Block B,Head Teacher,Suresh Lal,9876543213`

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setValidation(null)
    }
  }

  async function handleValidate() {
    if (!file || !cohortId) return
    setValidating(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('cohort_id', cohortId)

    try {
      const res = await fetch('/api/admin/roster/import', { method: 'POST', body: formData })
      const json = await res.json()
      setValidation(json)
    } catch {
      toast({ title: 'Validation failed', variant: 'destructive' })
    } finally {
      setValidating(false)
    }
  }

  async function handleConfirmImport() {
    if (!validation || validation.errors.length > 0) return
    setImporting(true)

    try {
      const res = await fetch('/api/admin/roster/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohort_id: cohortId, teachers: validation.preview }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      toast({ title: `${json.imported} teachers imported successfully` })
      setFile(null)
      setValidation(null)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dtsp_teacher_roster_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">Roster Import</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV to add teachers in bulk</p>
      </div>

      {/* Template download */}
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">CSV template</p>
            <p className="text-xs text-muted-foreground">
              Required columns: name, school_name. Optional: phone, udise_code, block_tag, designation, hm_name, hm_phone
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 shrink-0">
            <FileText className="h-4 w-4" />
            Download template
          </Button>
        </CardContent>
      </Card>

      {/* Upload form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Upload roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cohort *</Label>
            <Select value={cohortId} onValueChange={setCohortId}>
              <SelectTrigger><SelectValue placeholder="Select cohort…" /></SelectTrigger>
              <SelectContent>
                {cohorts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CSV file *</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              {file ? (
                <p className="text-sm font-medium">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to select CSV file</p>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>

          <Button
            onClick={handleValidate}
            disabled={!file || !cohortId || validating}
            variant="outline"
          >
            {validating ? 'Validating…' : 'Validate CSV'}
          </Button>
        </CardContent>
      </Card>

      {/* Validation results */}
      {validation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Validation report
              {validation.errors.length === 0 ? (
                <Badge className="bg-green-100 text-green-700">Ready to import</Badge>
              ) : (
                <Badge variant="destructive">{validation.errors.length} errors</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                {validation.valid} valid rows
              </span>
              {validation.warnings.length > 0 && (
                <span className="flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  {validation.warnings.length} warnings
                </span>
              )}
              {validation.errors.length > 0 && (
                <span className="flex items-center gap-1.5 text-red-700">
                  <XCircle className="h-4 w-4" />
                  {validation.errors.length} errors
                </span>
              )}
            </div>

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="space-y-1">
                {validation.errors.map((e, i) => (
                  <div key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                    Row {e.row}: {e.field} — {e.message}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="space-y-1">
                {validation.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                    Row {w.row}: {w.field} — {w.message}
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            {validation.valid > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(validation.preview[0] ?? {}).map((k) => (
                        <th key={k} className="text-left py-1 pr-3 font-medium text-muted-foreground">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validation.preview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-muted">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="py-1 pr-3">{v as string}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validation.valid > 5 && (
                  <p className="text-xs text-muted-foreground mt-1">+{validation.valid - 5} more rows</p>
                )}
              </div>
            )}

            {validation.errors.length === 0 && validation.valid > 0 && (
              <Button onClick={handleConfirmImport} disabled={importing} className="gap-2">
                <Upload className="h-4 w-4" />
                {importing ? 'Importing…' : `Import ${validation.valid} teachers`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
