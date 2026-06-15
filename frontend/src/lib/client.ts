import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://yiteeiyzftrmmmhqezez.supabase.co",
    "sb_publishable_07PgFX7BhcsllJwWj2bdLQ_hH-T60cD"
  )
}
