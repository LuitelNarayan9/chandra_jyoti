import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Chandra Jyoti Sanstha",
  description: "Cookie Policy for Chandra Jyoti Sanstha platform.",
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl relative z-10">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 font-(family-name:--font-outfit) tracking-tight">
        Cookie Policy
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
          This Cookie Policy explains how Chandra Jyoti Sanstha uses cookies and
          similar technologies to recognize you when you visit our platform. It
          explains what these technologies are and why we use them, as well as
          your rights to control our use of them.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">What are cookies?</h2>
        <p className="mb-4">
          Cookies are small data files that are placed on your computer or
          mobile device when you visit a website. Cookies are widely used by
          website owners in order to make their websites work, or to work more
          efficiently, as well as to provide reporting information.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Why do we use cookies?
        </h2>
        <p className="mb-4">
          We use first and third-party cookies for several reasons. Some cookies
          are required for technical reasons in order for our platform to
          operate, and we refer to these as "essential" or "strictly necessary"
          cookies. For instance, these are necessary for user authentication and
          security.
        </p>
      </div>
    </div>
  );
}
