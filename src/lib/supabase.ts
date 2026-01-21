import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined. Please check your .env file.')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.')
}

// Create Supabase client with fallback to prevent crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key')
}

// Get current environment from Supabase URL or env variable
export const getEnvironment = (): 'DEV' | 'BETA' | 'PROD' | 'LOCAL' => {
  const appEnv = import.meta.env.VITE_APP_ENV

  if (appEnv) {
    return appEnv.toUpperCase() as 'DEV' | 'BETA' | 'PROD' | 'LOCAL'
  }

  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return 'LOCAL'
  }

  // Parse environment from Supabase URL (e.g., ax-dev, ax-beta, ax-prod)
  if (supabaseUrl.includes('-dev')) return 'DEV'
  if (supabaseUrl.includes('-beta')) return 'BETA'
  if (supabaseUrl.includes('-prod')) return 'PROD'

  return 'LOCAL'
}
