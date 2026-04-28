import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Font,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
          webFont={undefined}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>
              MyHome<span style={logoAccent}>Styler</span>
            </Text>
          </Section>

          <Section style={card}>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>
              Welcome to MyHomeStyler! You now have{" "}
              <strong>2 free credits</strong> to try our AI-powered floor plan
              tools.
            </Text>
            <Text style={paragraph}>Here's what you can do:</Text>
            <Text style={listItem}>✦ Convert 2D floor plans into stunning 3D renders</Text>
            <Text style={listItem}>✦ Generate custom floor plans with AI</Text>
            <Text style={listItem}>✦ Download and share your results</Text>

            <Section style={btnWrap}>
              <Button href="https://myhomestyler.com/dashboard" style={btn}>
                Go to Dashboard
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            You're receiving this because you signed up at myhomestyler.com.
            <br />
            © {new Date().getFullYear()} MyHomeStyler. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#faf7f4",
  fontFamily: "Georgia, serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 24px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "32px",
};

const logoText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#27282f",
  margin: 0,
  letterSpacing: "-0.02em",
};

const logoAccent: React.CSSProperties = {
  color: "#fb3b01",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  padding: "36px 32px",
  border: "1px solid rgba(0,0,0,0.07)",
};

const greeting: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#27282f",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#475569",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const listItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.7",
  margin: "0 0 4px",
  paddingLeft: "4px",
};

const btnWrap: React.CSSProperties = {
  textAlign: "center",
  marginTop: "28px",
};

const btn: React.CSSProperties = {
  backgroundColor: "#fb3b01",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  padding: "12px 28px",
  borderRadius: "4px",
  textDecoration: "none",
  display: "inline-block",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(0,0,0,0.08)",
  margin: "28px 0 20px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center",
  lineHeight: "1.6",
  margin: 0,
};
