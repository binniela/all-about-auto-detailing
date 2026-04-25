import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

function readFlag(name) {
  const index = process.argv.indexOf(`--${name}`)
  if (index === -1) {
    return ''
  }

  return process.argv[index + 1] ?? ''
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const businessId =
  readFlag('business-id').trim() ||
  process.env.BUSINESS_ID ||
  process.env.NEXT_PUBLIC_BUSINESS_ID ||
  process.env.VITE_BUSINESS_ID ||
  ''
const email = readFlag('email').trim()
const password = readFlag('password')
const role = readFlag('role').trim() || 'owner'

if (!url || !serviceRoleKey) {
  console.error(
    'Set NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL / SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your environment.',
  )
  process.exit(1)
}

if (!businessId || !email || !password) {
  console.error('Usage: npm run create:portal-user -- --business-id your-business-id --email you@example.com --password temporary-password [--role owner]')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error) {
  console.error(error.message)
  process.exit(1)
}

if (!data.user) {
  console.error('Supabase did not return a created user.')
  process.exit(1)
}

const { error: businessUserError } = await supabase.from('BusinessUser').upsert(
  {
    businessId,
    authUserId: data.user.id,
    role,
  },
  {
    onConflict: 'businessId,authUserId',
  },
)

if (businessUserError) {
  console.error(businessUserError.message)
  process.exit(1)
}

console.log(`Created portal user <${email}> and linked it to business ${businessId} as ${role}.`)
