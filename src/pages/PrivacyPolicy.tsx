import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Privacy Policy for Dhyanam – Meditation Puzzle</h1>
        <Button variant="outline" asChild>
          <Link to="/">Return to Game</Link>
        </Button>
      </div>
      
      <div className="bg-black/30 p-6 rounded-lg shadow-lg text-white/90">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Privacy Policy for Dhyanam – The Game</h2>
          <p className="mb-3">
            Effective Date: 24th May 2025
          </p>
          <p className="mb-3">
            Welcome to Dhyanam – The Game ("we," "our," or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile game "Dhyanam," available on the Google Play Store.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
          <p className="mb-3">
            We collect the following types of information:
          </p>
          
          <h3 className="text-xl font-medium mb-2">a. Personal Information (Optional)</h3>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>Name or nickname (entered during gameplay or leaderboard submission).</li>
            <li>Google account identifier (only if signed in via Google Play Games Services).</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">b. Non-Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>Gameplay data (e.g., high scores, level progression, achievements, session duration).</li>
            <li>Device information (e.g., device type, operating system version, screen resolution, crash logs).</li>
            <li>IP address and region (used for analytics and localization purposes).</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">c. In-App Purchase Information</h3>
          <p>
            If you purchase additional game items (such as extra Vardaans/lives), the transaction is processed securely by the Google Play billing service. We do not collect or store payment details.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="mb-3">
            We use your data for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To operate and improve the game experience.</li>
            <li>To personalize content, rewards, and difficulty progression.</li>
            <li>To store and display leaderboard rankings and achievements.</li>
            <li>To process in-app purchases and restore entitlements.</li>
            <li>To detect and fix bugs or crashes.</li>
            <li>To comply with legal obligations and Play Store policies.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Data Sharing and Disclosure</h2>
          <p className="mb-3">
            We do not sell or rent your personal information to third parties. However, we may share data with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Google Play Services and Firebase (for cloud storage, analytics, and crash reporting).</li>
            <li>Service providers that help operate and maintain the game backend (e.g., Firebase Hosting, Firebase Authentication).</li>
            <li>Law enforcement or regulatory authorities if required by law.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Children's Privacy</h2>
          <p>
            Our game is suitable for general audiences and does not knowingly collect personal data from children under the age of 13 (or the applicable age of digital consent in your region). If we discover such data has been collected, we will promptly delete it.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Security</h2>
          <p>
            We use industry-standard measures to protect your data, including encryption in transit and secure authentication protocols. However, no digital transmission or storage system is 100% secure.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Your Rights and Choices</h2>
          <p className="mb-3">
            You may:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Reset or delete your leaderboard data (by contacting us via email).</li>
            <li>Uninstall the app to stop further data collection.</li>
            <li>Contact us for any questions or data access requests.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
          <p className="mb-3">
            Our app may integrate with third-party services such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Google Play Games Services (achievements and leaderboards).</li>
            <li>Firebase (Analytics, Crashlytics, Remote Config).</li>
          </ul>
          <p className="mt-2">
            These services may collect and process data according to their own privacy policies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Changes to this Policy</h2>
          <p>
            We may update this policy from time to time. You will be notified of material changes via an in-app message or update log. Continued use of the app constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p className="mb-3">
            If you have any questions or concerns about this Privacy Policy or your data:
          </p>
          <p className="mb-1">Email: bharatdeveloperteam@gmail.com</p>
          <p className="mb-1">Developer Name: Nious Technologies</p>
          <p className="mb-1">Game: Dhyanam - Meditation Puzzle</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
