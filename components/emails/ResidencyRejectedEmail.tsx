import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResidencyRejectedEmailProps {
  userName: string;
}

export const ResidencyRejectedEmail = ({
  userName,
}: ResidencyRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Update on your Residency Request</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Request Update</Heading>

          <Text style={text}>Hello {userName},</Text>

          <Text style={text}>
            Thank you for your interest in the Chandra Jyoti Dhanbari Family
            Tree. Unfortunately, the administrator was unable to verify your
            residency based on the information provided.
          </Text>

          <Text style={text}>
            If you believe this was a mistake, you are welcome to submit a new
            request with updated details. Please ensure the information you
            provide is accurate to help us verify your connection to the village.
          </Text>

          <Text style={text}>
            We appreciate your understanding and patience.
          </Text>

          <Text style={footer}>— The Chandra Jyoti Dhanbari Team</Text>
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
  color: "#dc2626",
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

export default ResidencyRejectedEmail;
