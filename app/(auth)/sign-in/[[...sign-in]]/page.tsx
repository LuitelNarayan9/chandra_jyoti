import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Panel - Brand / Visual */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-10 text-white lg:flex xl:w-2/5">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-[40%] -top-[40%] h-[180%] w-[180%] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl" />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.03]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-90 transition-opacity">
            <span className="text-3xl">🏛️</span>
            <span className="text-xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
              Chandra Jyoti
            </span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="mb-6 text-4xl font-bold leading-tight font-[family-name:var(--font-outfit)] tracking-tight">
            Welcome back to your community
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Stay connected with the families of Tumin Dhanbari. Access the latest
            news, events, and preserve our rich heritage together.
          </p>
        </div>

        {/* Footer / Quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-zinc-400">
            "A community is not just a group of people, it's a feeling of
            belonging."
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2 xl:w-3/5">
        {/* Back Button (Mobile only) */}
        <div className="absolute left-4 top-4 lg:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Top Right Action */}
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <span className="mr-2 text-sm text-muted-foreground hidden sm:inline-block">
            Don't have an account?
          </span>
          <Button variant="ghost" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>

        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to access your account
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none border-0 bg-transparent p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                formFieldInput:
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                socialButtonsBlockButton:
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                footerActionLink: "text-primary hover:underline underline-offset-4",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Simple button component for local use to avoid circular deps if needed, 
// but we should use the shadcn one usually. Integrating here for cleaner file.
import { Button } from "@/components/ui/button";
