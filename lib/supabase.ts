import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ljomskvgvwjscmqmohtb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb21za3Zndndqc2NtcW1vaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjYzMzQsImV4cCI6MjEwNTgwMjMzNH0.ImoV6VonRfASc0KHBYZSqA0mf0bTlCBReflQyLYqpZ4'

console.log('Initializing Supabase with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
