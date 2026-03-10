import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/lib/supabase/types'

const PUBLIC_ROUTES = ['/login', '/auth/callback']
const ROLE_HOME: Record<UserRole, string> = {
  coach: '/coach',
  cm: '/cm',
  admin: '/admin',
  observer: '/observer',
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Unauthenticated users
  if (!user) {
    // Allow public routes
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
      return supabaseResponse
    }
    // Redirect to login with return path
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // --- Authenticated from here ---

  // Allow role-select page and switch-role API
  if (pathname === '/role-select' || pathname === '/api/auth/switch-role') {
    return supabaseResponse
  }

  // Allow auth callback
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // Single profile fetch for all authenticated routes
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = profile.role as UserRole

  // Logged-in user hitting /login — redirect to their workspace
  if (pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/login', request.url))
  }

  // Root path — redirect to role home
  if (pathname === '/') {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
  }

  // Block cross-role access (admin can access all)
  const protectedPrefixes = ['/coach', '/cm', '/admin', '/observer']
  const accessedPrefix = protectedPrefixes.find((p) => pathname.startsWith(p))
  if (accessedPrefix && !pathname.startsWith(`/${role}`)) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
