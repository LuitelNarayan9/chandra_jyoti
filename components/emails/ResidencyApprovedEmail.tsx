import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "react-email";
import * as React from "react";

interface ResidencyApprovedEmailProps {
  userName: string;
}

export const ResidencyApprovedEmail = ({
  userName,
}: ResidencyApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Residency Request has been Approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Request Approved! 🎉</Heading>

          <Text style={text}>Hello {userName},</Text>

          <Text style={text}>
            Great news! The administrator of Chandra Jyoti Dhanbari has reviewed
            and <strong>approved</strong> your residency request.
          </Text>

          <Text style={text}>
            You now have full access to view, explore, and add members to the
            village's interactive Family Tree.
          </Text>

          <Text style={text}>Log into your account to check it out!</Text>

          <Text style={footer}>— Chandra Jyoti Dhanbari Team</Text>
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
  color: "#16a34a",
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

const footer = {
  color: "#898989",
  fontSize: "14px",
  marginLeft: "40px",
  marginRight: "40px",
  marginTop: "30px",
};

export default ResidencyApprovedEmail;
