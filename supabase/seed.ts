/**
 * DTSP Coach Platform — Seed Script
 *
 * Creates auth users via Supabase Admin API, then runs seed.sql for all other data.
 *
 * Usage:
 *   npx tsx supabase/seed.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  console.error('Run with: npx dotenv -e .env.local -- npx tsx supabase/seed.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Pre-defined UUIDs must match seed.sql
const SEED_USERS = [
  { id: 'b0000000-0000-0000-0000-000000000001', email: 'aarav.sharma@example.com', name: 'Aarav Sharma', role: 'admin' },
  { id: 'b0000000-0000-0000-0000-000000000002', email: 'neha.gupta@example.com', name: 'Neha Gupta', role: 'observer' },
  { id: 'b0000000-0000-0000-0000-000000000010', email: 'priya.singh@example.com', name: 'Priya Singh', role: 'cm' },
  { id: 'b0000000-0000-0000-0000-000000000011', email: 'ravi.verma@example.com', name: 'Ravi Verma', role: 'cm' },
  { id: 'b0000000-0000-0000-0000-000000000101', email: 'sunita.devi@example.com', name: 'Sunita Devi', role: 'coach' },
  { id: 'b0000000-0000-0000-0000-000000000102', email: 'manoj.kumar@example.com', name: 'Manoj Kumar', role: 'coach' },
  { id: 'b0000000-0000-0000-0000-000000000103', email: 'kavita.yadav@example.com', name: 'Kavita Yadav', role: 'coach' },
  { id: 'b0000000-0000-0000-0000-000000000104', email: 'deepak.tiwari@example.com', name: 'Deepak Tiwari', role: 'coach' },
  { id: 'b0000000-0000-0000-0000-000000000105', email: 'anjali.mishra@example.com', name: 'Anjali Mishra', role: 'coach' },
]

async function main() {
  console.log('=== DTSP Seed Script ===\n')

  // Step 1: Delete existing seed auth users (ignore errors for non-existent)
  console.log('Step 1: Cleaning existing seed auth users...')
  for (const user of SEED_USERS) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error && !error.message.includes('not found')) {
      console.warn(`  Warning deleting ${user.name}: ${error.message}`)
    }
  }
  console.log('  Done.\n')

  // Step 2: Create auth users with pre-defined UUIDs
  console.log('Step 2: Creating auth users...')
  for (const user of SEED_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    })
    if (error) {
      console.error(`  FAILED: ${user.name} (${user.email}): ${error.message}`)
    } else {
      console.log(`  Created: ${user.name} (${user.role}) — ${data.user.id}`)
    }
  }
  console.log()

  // Step 3: Run seed.sql
  console.log('Step 3: Running seed.sql...')
  const sqlPath = resolve(__dirname, 'seed.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  // Split on semicolons, filter empties, run each statement
  // We need to handle the DISABLE/ENABLE TRIGGER statements specially
  const { error: sqlError } = await supabase.rpc('exec_sql', { query: sql }).maybeSingle()

  if (sqlError) {
    // If exec_sql RPC doesn't exist, fall back to running via REST
    console.log('  exec_sql RPC not available, running SQL directly...')

    // Run the full SQL as a single query via the management API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    })

    // If RPC approach doesn't work, use the SQL endpoint directly
    console.log('  Using Supabase SQL endpoint...')
    const sqlResponse = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (!sqlResponse.ok) {
      console.log(`  SQL endpoint returned ${sqlResponse.status}`)
      console.log('  Please run seed.sql manually in the Supabase SQL Editor.')
      console.log(`  File: ${sqlPath}`)
    } else {
      const result = await sqlResponse.json()
      console.log('  SQL executed successfully.')
    }
  } else {
    console.log('  SQL executed successfully.')
  }

  console.log('\n=== Seed complete ===')
  console.log('\nSeed users (all with email_confirm: true):')
  console.log('┌─────────────────────┬──────────┬──────────────────────────────┐')
  console.log('│ Name                │ Role     │ Email                        │')
  console.log('├─────────────────────┼──────────┼──────────────────────────────┤')
  for (const u of SEED_USERS) {
    console.log(`│ ${u.name.padEnd(19)} │ ${u.role.padEnd(8)} │ ${u.email.padEnd(28)} │`)
  }
  console.log('└─────────────────────┴──────────┴──────────────────────────────┘')
  console.log('\nNote: These are dummy auth users with @example.com emails.')
  console.log('Real users log in via Google OAuth with @csf.org.in emails.')
  console.log('If the SQL did not run automatically, paste seed.sql into the Supabase SQL Editor.')
}

main().catch(console.error)
