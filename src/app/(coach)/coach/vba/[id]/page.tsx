import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { VBAWorkspace } from './VBAWorkspace'

export default async function VBAPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vbaSession, error } = await supabase
    .from('vba_sessions')
    .select(`
      *,
      teacher:teachers(id, name, school_name, phone)
    `)
    .eq('id', id)
    .single()

  if (error || !vbaSession) notFound()

  const { data: studentResults } = await supabase
    .from('vba_student_results')
    .select('*')
    .eq('vba_session_id', id)
    .order('student_number')

  // Get VBA checklist from program standards
  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  let vbaChecklist: { id: string; label: string; order: number }[] = []
  if (profile?.cohort_id) {
    const { data: template } = await supabase
      .from('session_templates')
      .select('vba_checklist')
      .eq('cohort_id', profile.cohort_id)
      .maybeSingle()
    if (template?.vba_checklist) vbaChecklist = template.vba_checklist
  }

  return (
    <VBAWorkspace
      vbaSession={vbaSession}
      studentResults={studentResults ?? []}
      vbaChecklist={vbaChecklist}
    />
  )
}
