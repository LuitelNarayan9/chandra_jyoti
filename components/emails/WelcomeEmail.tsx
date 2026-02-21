import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Img,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Chandra Jyoti Sanstha!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Chandra Jyoti Sanstha</Heading>
          </Section>
          <Section style={content}>
            <Text style={greeting}>
              Namaste {firstName || "Family Member"},
            </Text>
            <Text style={paragraph}>
              Welcome to the Chandra Jyoti Sanstha platform! We are absolutely
              thrilled to have you join our digital community.
            </Text>
            <Text style={paragraph}>
              Our platform is designed to help you connect with extended family
              members, explore our shared heritage through the genealogy tree,
              and stay up-to-date with the latest community news and events.
            </Text>
            <Text style={paragraph}>
              Click the button below to head to your dashboard and start
              exploring:
            </Text>
            <Section style={btnContainer}>
              <Link
                href={
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://chandrajyotisanstha.online"
                }
                style={button}
              >
                Go to Dashboard
              </Link>
            </Section>
            <Hr style={hr} />
            <Text style={footerText}>
              If you have any questions or need assistance, feel free to reach
              out to us via our Contact page.
            </Text>
            <Text style={footerText}>
              Best regards,
              <br />
              The Chandra Jyoti Sanstha Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  maxWidth: "580px",
};

const header = {
  padding: "32px",
  backgroundColor: "#1c1917",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "32px",
};

const greeting = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "24px",
};

const paragraph = {
  color: "#52525b",
  fontSize: "16px",
  lineHeight: "26px",
  marginBottom: "24px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
  marginTop: "16px",
};

const button = {
  backgroundColor: "#1c1917",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footerText = {
  color: "#a1a1aa",
  fontSize: "14px",
  lineHeight: "24px",
};
