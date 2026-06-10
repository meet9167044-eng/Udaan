import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UdaanScore — AI-Powered Trust Score Platform",
  description:
    "UdaanScore delivers alternative Trust Scoring from UPI behavior, utility payments, GST compliance, and cash-flow stability — so credit is earned continuously, not denied permanently.",
  keywords: "trust score, alternative credit, fintech, loan offers, UPI scoring, UdaanScore, India",
  openGraph: {
    title: "UdaanScore — AI-Powered Trust Score Platform",
    description: "AI-powered alternative Trust Scoring for thin-file borrowers and MSMEs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="page-main">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
