import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qhamqidcudhfvcrhhyql.supabase.co'      
 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoYW1xaWRjdWRoZnZjcmhoeXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcxODg0MzMsImV4cCI6MjAzMjc2NDQzM30.P-s7_GZq4K1HZmiwy4LzLuwwFR998CtTh20nsdxrw4E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})






// import 'react-native-url-polyfill/auto'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { createClient } from '@supabase/supabase-js'

// export const supabase = createClient(
//   process.env.EXPO_PUBLIC_SUPABASE_URL || "",
//   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
//   {
//     auth: {

//       storage: AsyncStorage,
//       autoRefreshToken: true,
//       persistSession: true,
//       detectSessionInUrl: false,
//     },
//   })
        