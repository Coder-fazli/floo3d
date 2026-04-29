import { Resend } from "resend";
import { WelcomeEmail } from "./emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "MyHomeStyler <hello@myhomestyler.com>";

export async function sendWelcomeEmail(to: string, name: string) {
    const { data, error } = await resend.emails.send({
        from: FROM,
        to,
        subject: "Welcome to MyHomeStyler ✦",
        react: WelcomeEmail({ name }),
    });
    if (error) {
        console.error("[Resend] Failed to send welcome email to", to, error);
        throw error;
    }
    console.log("[Resend] Welcome email sent to", to, "id:", data?.id);
}
