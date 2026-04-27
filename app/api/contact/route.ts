import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function sanitize(str: string): string {
    return str                                           
      .replace(/&/g, "&amp;")                          
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "MyHomeStyler Support <support@myhomestyler.com>",
    to: "myhomestylercom@gmail.com",
    replyTo: email,
    subject: `Support request from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0f172a;margin-bottom:4px;">New Support Message</h2>
        <p style="color:#64748b;font-size:14px;margin-top:0;">via MyHomeStyler contact form</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
        <p><strong>Name:</strong> ${sanitize(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${sanitize(email)}">${sanitize(email)}</a></p>
        <p><strong>Message:</strong></p>
        <p style="background:#f8fafc;padding:16px;border-radius:12px;line-height:1.6;">${sanitize(message).replace(/\n/g, "<br/>")}</p>
      </div>`,
      });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
