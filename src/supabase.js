import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mcluthihqzktdpymaiyy.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbHV0aGlocXprdGRweW1haXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTYzODUsImV4cCI6MjA4OTYzMjM4NX0.xfu-qTWeU8QSOid5XH3AvScduGBtBJ6kIA6yupjFbJg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)