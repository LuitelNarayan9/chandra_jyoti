import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResidencyRequestEmailProps {
  userName: string;
  userEmail: string;
  fatherName: string;
  motherName: string;
}

export const ResidencyRequestEmail = ({
  userName,
  userEmail,
  fatherName,
  motherName,
}: ResidencyRequestEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Residency Verification Request from {userName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Residency Request</Heading>

          <Text style={text}>
            A new user has submitted a request to be verified as a resident of
            Tumin Dhanbari village to access the Family Tree features.
          </Text>

          <Section style={dataSection}>
            <Text style={text}>
              <strong>User Name:</strong> {userName}
            </Text>
            <Text style={text}>
              <strong>Email:</strong> {userEmail}
            </Text>
            <Text style={text}>
              <strong>Father's Name:</strong> {fatherName}
            </Text>
            <Text style={text}>
              <strong>Mother's Name:</strong> {motherName}
            </Text>
          </Section>

          <Text style={text}>
            The user has electronically confirmed that the provided details are
            accurate and they understand the community guidelines.
          </Text>

          <Text style={footer}>
            Please review this request in the admin panel and update their
            <code>isResidentOfTuminDhanbari</code> status if approved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
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
  border: "1px solid #e6ebf1",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  marginLeft: "40px",
  marginRight: "40px",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  marginLeft: "40px",
  marginRight: "40px",
};

const dataSection = {
  backgroundColor: "#f4f4f4",
  padding: "20px",
  marginLeft: "40px",
  marginRight: "40px",
  borderRadius: "4px",
  marginTop: "20px",
  marginBottom: "20px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  marginLeft: "40px",
  marginRight: "40px",
  marginTop: "30px",
};

export default ResidencyRequestEmail;
