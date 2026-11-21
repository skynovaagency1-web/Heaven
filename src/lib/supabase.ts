import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Null until the Supabase env vars are set; the site then runs in browser-only demo mode. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null
export const live = supabase !== null
