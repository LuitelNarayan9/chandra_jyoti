import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Chandra Jyoti Sanstha",
  description: "Privacy Policy for Chandra Jyoti Sanstha platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl relative z-10">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 font-(family-name:--font-outfit) tracking-tight">
        Privacy Policy
      </h1>
      <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-stone-300 leading-relaxed">
        <p className="lead text-lg mb-6">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="mb-4">
          Welcome to the Chandra Jyoti Sanstha platform. We respect your privacy
          and are committed to protecting your personal data. This privacy
          policy will inform you as to how we look after your personal data when
          you visit our website (regardless of where you visit it from) and tell
          you about your privacy rights and how the law protects you.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          1. Important Information and Who We Are
        </h2>
        <p className="mb-4">
          Chandra Jyoti Sanstha is the controller and responsible for your
          personal data. We have appointed a data privacy manager who is
          responsible for overseeing questions in relation to this privacy
          policy.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          2. The Data We Collect About You
        </h2>
        <p className="mb-4">
          Personal data, or personal information, means any information about an
          individual from which that person can be identified. We may collect,
          use, store and transfer different kinds of personal data about you.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          3. How Is Your Personal Data Collected?
        </h2>
        <p className="mb-4">
          We use different methods to collect data from and about you including
          through direct interactions, automated technologies or interactions,
          and third parties or publicly available sources.
        </p>
      </div>
    </div>
  );
}
