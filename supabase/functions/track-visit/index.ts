import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

const EXPECTED_SECRET = Deno.env.get("VISIT_TRACKING_SECRET") ?? "";
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return handleOptions();

  // Verify shared secret — only the marketing site's server can call this
  const auth = req.headers.get("authorization") ?? "";
  if (!EXPECTED_SECRET || auth !== `Bearer ${EXPECTED_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { path, referrer, country, region, city, user_agent } = payload;

  if (!path || typeof path !== "string") {
    return new Response(JSON.stringify({ error: "Missing required field: path" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { error } = await supabase.from("site_visits").insert({
    path,
    referrer:   referrer   ?? null,
    country:    country    ?? null,
    region:     region     ?? null,
    city:       city       ?? null,
    user_agent: user_agent ?? null,
  });

  if (error) {
    console.error("[track-visit] insert failed:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
