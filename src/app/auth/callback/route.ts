import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/lib/supabase/types'
import { isAllowedEmail } from '@/lib/allowed-users'
import { createAdminClient } from '@/lib/supabase/admin'

const ROLE_HOME: Record<UserRole, string> = {
  coach: '/coach',
  cm: '/cm',
  admin: '/admin',
  observer: '/observer',
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const userEmail = data.user.email

  // Check if user's email is in the allowed list
  if (!userEmail || !isAllowedEmail(userEmail)) {
    // Sign out the unauthorized user
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=access_denied`)
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile) {
    // Existing user — redirect to their role home
    const home = ROLE_HOME[profile.role as UserRole] ?? '/'
    return NextResponse.redirect(`${origin}${home}`)
  }

  // New user — create profile with default role 'admin', then send to admin home
  const admin = createAdminClient()
  const displayName = data.user.user_metadata?.full_name
    || data.user.user_metadata?.name
    || userEmail.split('@')[0]

  await admin.from('profiles').insert({
    id: data.user.id,
    role: 'admin',
    name: displayName,
  })

  return NextResponse.redirect(`${origin}/admin`)
}
