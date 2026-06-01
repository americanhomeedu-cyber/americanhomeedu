import { createClient } from '@/lib/supabase/server'

/** Returns the server client + the user IF they are an admin, else user=null. */
export async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null }
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { supabase, user: data?.role === 'admin' ? user : null }
}
