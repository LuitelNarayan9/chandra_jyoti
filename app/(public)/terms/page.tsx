import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Chandra Jyoti Sanstha",
  description: "Terms of Service for Chandra Jyoti Sanstha platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl relative z-10">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 font-(family-name:--font-outfit) tracking-tight">
        Terms of Service
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
          These terms and conditions outline the rules and regulations for the
          use of Chandra Jyoti Sanstha&apos;s Website and Platform.
        </p>
        <p className="mb-4">
          By accessing this website we assume you accept these terms and
          conditions. Do not continue to use the Chandra Jyoti Sanstha platform
          if you do not agree to take all of the terms and conditions stated on
          this page.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">License</h2>
        <p className="mb-4">
          Unless otherwise stated, Chandra Jyoti Sanstha and/or its licensors
          own the intellectual property rights for all material on the platform.
          All intellectual property rights are reserved. You may access this
          from Chandra Jyoti Sanstha for your own personal use subjected to
          restrictions set in these terms and conditions.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          User Comments and Content
        </h2>
        <p className="mb-4">
          Parts of this website offer an opportunity for users to post and
          exchange opinions, family history, and information in certain areas of
          the website. Chandra Jyoti Sanstha does not filter, edit, publish or
          review Comments prior to their presence on the website.
        </p>
      </div>
    </div>
  );
}
