import { ContactHero } from "@/components/contact/contact-hero";
import { ContactInfo } from "@/components/contact/contact-info";
import { ContactForm } from "@/components/contact/contact-form";
import { GoogleMap } from "@/components/contact/google-map";
import { FaqAccordion } from "@/components/contact/faq-accordion";
import { SocialLinks } from "@/components/contact/social-links";
import { CTABanner } from "@/components/landing/cta-banner";

export const metadata = {
  title: "Contact Us | Chandra Jyoti Sanstha",
  description:
    "Get in touch with the Chandra Jyoti Sanstha community. We are here to help and answer any questions you may have.",
};

export default function ContactUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ContactHero />

      <section
        id="contact-section"
        className="py-20 bg-stone-50 dark:bg-stone-950 transition-colors relative"
      >
        {/* Background glow effects matching the design system */}
        <div className="absolute top-40 right-0 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-40 left-10 w-120 h-120 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold font-(family-name:--font-outfit) mb-6 text-stone-900 dark:text-stone-100">
                  Contact Information
                </h2>
                <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
                  Whether you have a question about donations, family tree
                  updates, or just want to say hello, our team is ready to
                  answer all your questions.
                </p>
                <ContactInfo />
              </div>
              <SocialLinks />
            </div>

            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>

          <GoogleMap />

          <FaqAccordion />
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
