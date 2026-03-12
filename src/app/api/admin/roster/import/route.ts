import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const REQUIRED_FIELDS = ['name', 'school_name']
const OPTIONAL_FIELDS = ['phone', 'udise_code', 'block_tag', 'designation', 'hm_name', 'hm_phone']
const UDISE_PATTERN = /^\d{11}$/

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const cohortId = formData.get('cohort_id') as string | null

  if (!file || !cohortId) {
    return NextResponse.json({ error: 'file and cohort_id required' }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCSV(text)

  const errors: { row: number; field: string; message: string }[] = []
  const warnings: { row: number; field: string; message: string }[] = []
  const validRows: Record<string, string>[] = []

  // Get existing phones and UDISE codes to check uniqueness
  const admin = createAdminClient()
  const { data: existingTeachers } = await admin
    .from('teachers')
    .select('phone, udise_code')
    .eq('cohort_id', cohortId)

  const existingPhones = new Set(existingTeachers?.map((t) => t.phone).filter(Boolean))
  const existingUDISE = new Set(existingTeachers?.map((t) => t.udise_code).filter(Boolean))

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // 1-indexed, header is row 1
    let rowValid = true

    // Required fields
    for (const field of REQUIRED_FIELDS) {
      if (!row[field]?.trim()) {
        errors.push({ row: rowNum, field, message: `${field} is required` })
        rowValid = false
      }
    }

    // UDISE format validation
    if (row.udise_code && !UDISE_PATTERN.test(row.udise_code.replace(/\s/g, ''))) {
      errors.push({ row: rowNum, field: 'udise_code', message: 'UDISE code must be 11 digits' })
      rowValid = false
    }

    // Uniqueness checks
    if (row.phone && existingPhones.has(row.phone)) {
      warnings.push({ row: rowNum, field: 'phone', message: `Phone ${row.phone} already exists — will be skipped` })
    }
    if (row.udise_code && existingUDISE.has(row.udise_code)) {
      errors.push({ row: rowNum, field: 'udise_code', message: `UDISE ${row.udise_code} already exists in this cohort` })
      rowValid = false
    }

    if (rowValid) validRows.push(row)
  }

  return NextResponse.json({
    valid: validRows.length,
    errors,
    warnings,
    preview: validRows,
  })
}
