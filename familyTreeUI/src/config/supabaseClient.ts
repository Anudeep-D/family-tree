
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseKey = process.env.SUPABASE_KEY ?? '';
export const supaBucket = process.env.SUPABASE_BUCKET ?? '';

// Only initialise the client when credentials are present.
// This app uses Firebase/Google auth; Supabase is optional.
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;