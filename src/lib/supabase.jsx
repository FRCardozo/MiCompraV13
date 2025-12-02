import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yorvaazcldhgezttwciw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcnZhYXpjbGRoZ2V6dHR3Y2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjA1MzMsImV4cCI6MjA4MDEzNjUzM30.ZtsmX6iafbLx5yJ1SZhnd-KvUdtCFGVepBAsbaWRZF4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
