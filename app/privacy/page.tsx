// app/privacy/page.tsx
import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <LegalSection title="Who we are">
        <p>
          {LEGAL.appName} is a food planning app run by {LEGAL.operator}. We are the data controller for the
          information described here. Contact us at {LEGAL.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <ul className="list-disc space-y-1 pl-6">
          <li>Account details: your email address, your display name and your password. Your password is stored in scrambled (hashed) form by our sign-in provider, so we cannot read it.</li>
          <li>Preferences you choose: dietary preferences, allergies, preferred meal types, daily budget and theme. Allergies and dietary choices can reveal health information, so we collect them only if you enter them.</li>
          <li>Your activity: favourites, cooking history, pantry, shopping lists, meal plans, collections, custom recipes and photos you upload.</li>
          <li>Technical data: cookies that keep you signed in and sign you out after 30 days without use, and basic page-view statistics from Vercel Analytics.</li>
          <li>If we turn on Google sign-in, we receive your name and email from Google. If we turn on the Cloudflare security check, Cloudflare receives technical data about your browser to tell people from bots.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Why we use it">
        <p>
          To run your account, save your choices, show your plans and lists, keep the app secure and fix problems.
          We use it with your consent and because it is needed to give you the service. We do not sell your data
          and we do not use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Who else handles it">
        <p>
          We use these providers to run {LEGAL.appName}: Supabase (database, sign-in and file storage), Vercel
          (hosting and statistics), and, if enabled, Google and Cloudflare. They process data only to provide
          their service to us. Some of them may store or process data outside Kenya.
        </p>
        <p>If you share a meal plan link, anyone who has the link can see that plan.</p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your data while your account is active. To close your account and have your data deleted, write
          to {LEGAL.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Under the Data Protection Act, 2019 of Kenya you can ask to see your data, correct it, delete it, or
          object to how we use it. Write to {LEGAL.contactEmail}. You can also complain to the Office of the Data
          Protection Commissioner (ODPC) at odpc.go.ke.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data is sent over encrypted connections and each account can only open its own data. No system is
          perfectly secure, so please use a strong password and keep it private.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>{LEGAL.appName} is not meant for children under 18.</p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>If we change this policy, we will update the date at the top of this page.</p>
      </LegalSection>
    </LegalLayout>
  );
}