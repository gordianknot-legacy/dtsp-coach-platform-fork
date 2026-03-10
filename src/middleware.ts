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

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    // If logged in and hitting /login, redirect to their workspace
    if (user && pathname.startsWith('/login')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        const home = ROLE_HOME[profile.role as UserRole] ?? '/login'
        return NextResponse.redirect(new URL(home, request.url))
      }
    }
    return supabaseResponse
  }

  // Allow role-select page and switch-role API for authenticated users
  if (pathname === '/role-select' || pathname === '/api/auth/switch-role') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // Unauthenticated — redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Fetch profile for role-based access control
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Authenticated but no profile — send to login to re-authenticate
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = profile.role as UserRole

  // Enforce role-based route access
  const rolePrefix = `/${role}`
  if (pathname === '/') {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
  }

  // Block cross-role access (all 4 allowed users can switch roles, so we respect their current role)
  const protectedPrefixes = ['/coach', '/cm', '/admin', '/observer']
  const accessedPrefix = protectedPrefixes.find((p) => pathname.startsWith(p))
  if (accessedPrefix && !pathname.startsWith(rolePrefix)) {
    // Admin can access all routes
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
