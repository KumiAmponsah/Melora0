import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://lycvlvndenqotocowdhy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Y3Zsdm5kZW5xb3RvY293ZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMDQ5MDUsImV4cCI6MjA0Mzg4MDkwNX0.FOcZfCUDjYkUN0R7YwSyNx3HBe4B6s3Hn__Et92lCdU"
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

