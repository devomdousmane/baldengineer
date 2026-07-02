import { corsHeaders, handleOptions } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return handleOptions();

  let body: { body: string; signature: string; secret: string; algorithm?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { body: message, signature, secret, algorithm = "sha256" } = body;

  if (!message || !signature || !secret) {
    return new Response(JSON.stringify({ error: "Missing fields: body, signature, secret" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const algo = algorithm === "sha512" ? "SHA-512" : "SHA-256";

  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const msgData = enc.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: algo },
      false,
      ["verify"]
    );

    // Normalize signature: support both hex and base64
    let sigBytes: Uint8Array;
    if (/^[0-9a-fA-F]+$/.test(signature)) {
      sigBytes = new Uint8Array(
        signature.match(/.{2}/g)!.map((b: string) => parseInt(b, 16))
      );
    } else {
      const bin = atob(signature);
      sigBytes = new Uint8Array(bin.split("").map((c) => c.charCodeAt(0)));
    }

    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, msgData);
    return new Response(JSON.stringify({ valid }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "verification error";
    return new Response(JSON.stringify({ valid: false, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
