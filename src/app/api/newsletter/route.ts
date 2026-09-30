import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return NextResponse.json(
      { error: "Newsletter nije konfigurisan." },
      { status: 500 }
    );
  }

  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email adresa je obavezna." },
      { status: 400 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    await resend.contacts.create({
      email,
      audienceId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Došlo je do greške. Pokušaj ponovo." },
      { status: 500 }
    );
  }
}
