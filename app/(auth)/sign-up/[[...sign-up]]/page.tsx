"use client";

import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

const clerkElements = {
  rootBox: "w-full",
  cardBox: "w-full shadow-none border-0 bg-transparent p-0",
  card: "w-full shadow-none border-0 bg-transparent p-0",
  headerTitle: "hidden",
  headerSubtitle: "hidden",
  socialButtonsBlockButton:
    "h-11 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2",
  dividerLine: "bg-stone-200",
  dividerText: "text-stone-400 text-xs",
  formFieldLabel: "text-sm font-medium text-stone-700",
  formFieldInput:
    "h-11 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm transition-colors placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15",
  formButtonPrimary:
    "h-11 rounded-md bg-emerald-800 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2",
  footerAction: "text-sm text-stone-500",
  footerActionLink: "font-medium text-emerald-800 hover:text-emerald-900",
  identityPreviewText: "text-stone-700",
  formResendCodeLink: "text-emerald-800 hover:text-emerald-900",
};

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp
        appearance={{
          elements: clerkElements,
        }}
      />
    </AuthShell>
  );
}
