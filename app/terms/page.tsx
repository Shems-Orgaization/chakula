// app/terms/page.tsx
import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use">
      <LegalSection title="Using Chakula">
        <p>
          {LEGAL.appName} is run by {LEGAL.operator}. By creating an account or using the app you agree to these
          terms and to our Privacy Policy. You must be 18 or older. Keep your password private and tell us if you
          think someone else has used your account.
        </p>
      </LegalSection>

      <LegalSection title="Recipes, costs and health">
        <ul className="list-disc space-y-1 pl-6">
          <li>Prices are approximate and cover ingredients only. Gas, charcoal and transport are not included. Real prices change by market and season.</li>
          <li>Recipes are general cooking ideas. They are not medical or dietary advice.</li>
          <li>The app does not yet check recipes against your allergies. Always read the ingredients yourself and take extra care with allergies. If you have a medical condition, ask a health professional.</li>
          <li>Take normal care when cooking: heat, knives, raw meat and food storage.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You own the recipes, notes and photos you add. You allow us to store them and show them to you, and to
          others only where you choose to share them. Do not upload anything unlawful, offensive or that belongs
          to someone else.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not try to break, overload or misuse the app, reach other people&apos;s data, or use bots or
          automated tools against it. We may suspend accounts that do.
        </p>
      </LegalSection>

      <LegalSection title="No guarantees">
        <p>
          We work to keep {LEGAL.appName} accurate and available, but it is provided &quot;as is&quot;. It may have
          mistakes or be unavailable at times. To the extent the law allows, we are not responsible for losses
          that result from using the app. Nothing here limits rights you have under Kenyan consumer law.
        </p>
      </LegalSection>

      <LegalSection title="Ending your account">
        <p>
          You can stop using the app at any time and ask us to delete your account at {LEGAL.contactEmail}. We may
          suspend or close accounts that break these terms.
        </p>
      </LegalSection>

      <LegalSection title="Changes and law">
        <p>
          We may update these terms and will change the date above when we do. These terms are governed by the
          laws of Kenya.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}