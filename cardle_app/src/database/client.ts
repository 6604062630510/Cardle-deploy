
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpbhwfzklsmimwjarohl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYmh3ZnprbHNtaW13amFyb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDQ1OTgsImV4cCI6MjA1NjQ4MDU5OH0.QvRsjf5TGkI3g1LXWZmAiMJeYs89DRlMJMhKvcc2530'
export const supabase = createClient(supabaseUrl, supabaseKey)