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
            <Text style={headerSubText}>chandrajyotisanstha.online</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={label}>Full Name</Text>
            <Text style={value}>{name}</Text>

            <Hr style={divider} />

            <Text style={label}>Email Address</Text>
            <Text style={value}>{email}</Text>

            <Hr style={divider} />

            <Text style={label}>Phone</Text>
            <Text style={value}>{phone || "Not provided"}</Text>

            <Hr style={divider} />

            <Text style={label}>Subject</Text>
            <Text style={value}>{subject || "No Subject"}</Text>

            <Hr style={divider} />

            <Text style={label}>Message</Text>
            <Text style={messageBox}>{message}</Text>

            <Hr style={divider} />

            <Text style={label}>Submitted At</Text>
            <Text style={value}>{submittedAt}</Text>
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

const value: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  margin: "0 0 8px 0",
};

const messageBox: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  backgroundColor: "#f4f4f4",
  padding: "15px",
  borderRadius: "6px",
  whiteSpace: "pre-wrap",
  margin: "0 0 8px 0",
};

const divider: React.CSSProperties = {
  borderColor: "#eeeeee",
  margin: "16px 0",
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
