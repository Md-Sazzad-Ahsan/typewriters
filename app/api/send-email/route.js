// app/api/send-email/route.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const body = await req.json();
  const { to, subject, html } = body;

  try {
    const data = await resend.emails.send({
      from: 'Ahsan Himu <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
