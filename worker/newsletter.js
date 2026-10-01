const ALLOWED_ORIGIN = "https://ovojeproba.men";

function corsHeaders(origin) {
  if (origin !== ALLOWED_ORIGIN) return {};
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Metod nije dozvoljen." },
        { status: 405, headers }
      );
    }

    if (origin !== ALLOWED_ORIGIN) {
      return Response.json(
        { error: "Zahtev nije dozvoljen." },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Neispravan zahtev." },
        { status: 400, headers }
      );
    }

    const email = body.email;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json(
        { error: "Email adresa je obavezna." },
        { status: 400, headers }
      );
    }

    try {
      const res = await fetch("https://api.resend.com/audiences/" + env.RESEND_AUDIENCE_ID + "/contacts", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.RESEND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        return Response.json(
          { error: "Došlo je do greške. Pokušaj ponovo." },
          { status: 502, headers }
        );
      }

      return Response.json({ success: true }, { headers });
    } catch (err) {
      console.error("Fetch error:", err);
      return Response.json(
        { error: "Došlo je do greške. Pokušaj ponovo." },
        { status: 500, headers }
      );
    }
  },
};
