import { serve } from "https://deno.land/std@0.125.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm";

// Get environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_API_KEY = Deno.env.get("SUPABASE_API_KEY");

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  console.error("Supabase URL or API key is missing");
  Deno.exit(1); // Exit the script with an error code
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") {
    const html = await Deno.readTextFile("index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (req.method === "POST" && req.url === "/search") {
    const formData = await req.formData();
    const vin = formData.get("vin")?.toString();

    if (vin) {
      const { data: homenetinventoryfeed, error } = await supabase
        .from('homenetinventoryfeed')
        .select('*')
        .eq('VIN', vin)
        .single();

      if (error) {
        return new Response(`Error fetching data: ${error.message}`, {
          headers: { "Content-Type": "text/plain" },
        });
      }

      const results = JSON.stringify(homenetinventoryfeed, null, 2);
      return new Response(`<pre>${results}</pre>`, {
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  return new Response("Not Found", { status: 404 });
}

console.log("Server running on http://localhost:8000");
await serve(handler, { port: 8000 });
