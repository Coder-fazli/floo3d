import { Resend } from "resend";
import { WelcomeEmail } from "./emails/WelcomeEmail";

function getResend() {
    return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(to: string, name: string) {
    const FROM = process.env.RESEND_FROM ?? "MyHomeStyler <hello@myhomestyler.com>";
    const { data, error } = await getResend().emails.send({
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
