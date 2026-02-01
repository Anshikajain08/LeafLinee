import { supabase } from '@/lib/supabase'
import MyReportsClient from './MyReportsClient'

// Server Component - fetch initial data
export default async function MyReportsPage() {
  return <MyReportsClient />
}
