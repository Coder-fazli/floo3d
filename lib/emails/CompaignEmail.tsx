"use client";
import { Html, Body, Container, Text, Button, Img } from "@react-email/components";

export function CampaignEmail({ name, body, ctaText, ctaUrl, logoUrl, btnColor }: {
  name: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  logoUrl?: string;
  btnColor?: string;
}) {
  const brandColor = btnColor ?? "#fb3b01";

  return (
    <Html>
      <Body style={{ backgroundColor: "#faf7f4", fontFamily: "Georgia, serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 24px" }}>

          {/* Logo */}
          {logoUrl ? (
            <Img src={logoUrl} alt="MyHomeStyler" width={140} height={40} style={{ objectFit: "contain", marginBottom: "24px" }} />
          ) : (
            <Text style={{ fontSize: "22px", fontWeight: 700, color: "#27282f", margin: "0 0 24px" }}>
              MyHome<span style={{ color: brandColor }}>Styler</span>
            </Text>
          )}

          {/* Content */}
          <div style={{ background: "#ffffff", borderRadius: "14px", padding: "32px", border: "1px solid rgba(0,0,0,0.07)" }}>
            <Text style={{ fontSize: "15px", color: "#475569", lineHeight: "1.7", margin: "0 0 12px" }}>
              Hi {name},
            </Text>
            <Text style={{ fontSize: "15px", color: "#475569", lineHeight: "1.7", margin: "0 0 24px", whiteSpace: "pre-wrap" }}>
              {body}
            </Text>
            {ctaText && ctaUrl && (
              <Button href={ctaUrl} style={{
                backgroundColor: brandColor,
                color: "#fff",
                padding: "12px 28px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                display: "inline-block",
              }}>
                {ctaText}
              </Button>
            )}
          </div>

          <Text style={{ fontSize: "12px", color: "#94a3b8", marginTop: "24px", textAlign: "center" }}>
            You're receiving this because you signed up at myhomestyler.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
