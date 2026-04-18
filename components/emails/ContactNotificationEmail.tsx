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

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  submittedAt: string;
}

export function ContactNotificationEmail({
  name,
  email,
  subject,
  message,
  phone,
  submittedAt,
}: ContactNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>New Contact Form Submission</Heading>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Section style={metaBox}>
              <Text style={metaSpacing}>
                <span style={metaLabel}>Full Name</span>
                <br />
                <span style={metaValue}>{name}</span>
              </Text>

              <Text style={metaSpacing}>
                <span style={metaLabel}>Email Address</span>
                <br />
                <a href={`mailto:${email}`} style={metaLink}>
                  {email}
                </a>
              </Text>

              <Text style={metaSpacing}>
                <span style={metaLabel}>Phone Number</span>
                <br />
                <span style={metaValue}>{phone || "Not provided"}</span>
              </Text>

              <Text style={metaSpacing}>
                <span style={metaLabel}>Subject</span>
                <br />
                <span style={metaValue}>{subject || "No Subject"}</span>
              </Text>

              <Text style={metaSpacingLast}>
                <span style={metaLabel}>Submitted At</span>
                <br />
                <span style={metaValue}>{submittedAt}</span>
              </Text>
            </Section>

            <Text style={messageLabel}>Message Content</Text>
            <Text style={messageBox}>{message}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification from chandrajyotisanstha.online.
              Please do not reply to this email.
            </Text>
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
  backgroundColor: "#1a1a1a",
  padding: "30px 40px",
};

const headerText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 6px 0",
};

const headerSubText: React.CSSProperties = {
  color: "#aaaaaa",
  fontSize: "13px",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "30px 40px",
};

const label: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#888888",
  margin: "0 0 4px 0",
};

const metaBox: React.CSSProperties = {
  backgroundColor: "#f8faff",
  border: "1px solid #dbeafe",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 24px 0",
};

const metaSpacing: React.CSSProperties = {
  margin: "0 0 16px 0",
};

const metaSpacingLast: React.CSSProperties = {
  margin: "0",
};

const metaLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#2563eb",
};

const metaValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#1a1a1a",
  fontWeight: "500",
  lineHeight: "1.5",
};

const metaLink: React.CSSProperties = {
  fontSize: "15px",
  color: "#2563eb",
  textDecoration: "underline",
  fontWeight: "500",
};

const messageLabel: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#1a1a1a",
  margin: "0 0 8px 0",
};

const messageBox: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  backgroundColor: "#fcfcfc",
  padding: "16px",
  borderLeft: "4px solid #2563eb",
  borderRadius: "0 4px 4px 0",
  whiteSpace: "pre-wrap",
  margin: "0",
  lineHeight: "1.6",
  border: "1px solid #eeeeee",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  padding: "20px 40px",
  borderTop: "1px solid #eeeeee",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  margin: 0,
  textAlign: "center",
};
