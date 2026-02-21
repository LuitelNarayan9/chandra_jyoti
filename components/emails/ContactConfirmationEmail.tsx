import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Preview,
} from "@react-email/components";

interface ContactConfirmationEmailProps {
  name: string;
  message: string;
}

export function ContactConfirmationEmail({
  name,
  message,
}: ContactConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your message, {name}!</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>Thank You for Contacting Us</Heading>
            <Text style={headerSubText}>Chandrajyoti Sanstha</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={greeting}>Dear {name},</Text>

            <Text style={paragraph}>
              Thank you for reaching out to{" "}
              <strong>Chandrajyoti Sanstha</strong>. We have received your
              message and our team will get back to you within{" "}
              <strong>24-48 hours</strong>.
            </Text>

            <Text style={paragraph}>
              We appreciate your patience and look forward to assisting you.
            </Text>

            <Hr style={divider} />

            <Text style={label}>Your Message</Text>
            <Text style={messageBox}>{message}</Text>

            <Hr style={divider} />

            <Text style={paragraph}>
              If you have any urgent queries, please feel free to reach out to
              us directly by replying to this email.
            </Text>

            <Text style={signOff}>Warm regards,</Text>
            <Text style={signOffName}>Chandrajyoti Sanstha Team</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Chandrajyoti Sanstha. All rights reserved.
            </Text>
            <Text style={footerText}>chandrajyotisanstha.online</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily: "Arial, sans-serif",
  margin: 0,
  padding: "20px 0",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #e0e0e0",
};

const header: React.CSSProperties = {
  backgroundColor: "#2563eb",
  padding: "30px 40px",
};

const headerText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 6px 0",
};

const headerSubText: React.CSSProperties = {
  color: "#bfdbfe",
  fontSize: "13px",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "30px 40px",
};

const greeting: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0 0 16px 0",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#444444",
  lineHeight: "1.6",
  margin: "0 0 14px 0",
};

const label: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#888888",
  margin: "0 0 8px 0",
};

const messageBox: React.CSSProperties = {
  fontSize: "14px",
  color: "#555555",
  backgroundColor: "#f4f4f4",
  padding: "15px",
  borderRadius: "6px",
  borderLeft: "4px solid #2563eb",
  whiteSpace: "pre-wrap",
  margin: "0 0 8px 0",
};

const divider: React.CSSProperties = {
  borderColor: "#eeeeee",
  margin: "20px 0",
};

const signOff: React.CSSProperties = {
  fontSize: "15px",
  color: "#444444",
  margin: "16px 0 4px 0",
};

const signOffName: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: 0,
};

const footer: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  padding: "20px 40px",
  borderTop: "1px solid #eeeeee",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  margin: "2px 0",
};
