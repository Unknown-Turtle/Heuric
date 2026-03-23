// Supabase Edge Function to collect events from Heuric Web SDK
// DON'T WORRY ABOUT REDLINES IN IDE

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// IMPORTANT: Allow all origins so the SDK can send data from any website
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. Handle CORS preflight request (The browser asking "Can I POST here?")
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Initialize Supabase client using auto-injected environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Parse the incoming JSON payload from your SDK
    const { events } = await req.json()

    if (!events || !Array.isArray(events)) {
      throw new Error("Invalid payload: 'events' array missing.")
    }

    // 4. Insert the batch of events into the database
    const { error } = await supabaseClient
      .from('events')
      .insert(events)

    if (error) throw error

    // 5. Return success to the SDK
    return new Response(JSON.stringify({ success: true, count: events.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Ingestion Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

