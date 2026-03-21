import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Snap'n'Swap — Snap It. List It. Swap It.",
  description:
    "The marketplace where fashion gets a second life. Take a photo, AI identifies your item, set your price or swap with others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6EE7A0",
          colorBackground: "#0F0F14",
          colorInputBackground: "#16161D",
          colorInputText: "#EAEAF0",
          colorText: "#EAEAF0",
          colorTextSecondary: "#7A7A8A",
          colorTextOnPrimaryBackground: "#0F0F14",
          colorNeutral: "#EAEAF0",
          colorDanger: "#ef4444",
          borderRadius: "0.5rem",
          fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          rootBox: { width: "100%" },
          card: { backgroundColor: "#0F0F14", border: "1px solid #2A2A35", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
          modalBackdrop: { backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" },
          modalContent: { backgroundColor: "#0F0F14", border: "1px solid #2A2A35" },
          headerTitle: { color: "#EAEAF0" },
          headerSubtitle: { color: "#7A7A8A" },
          socialButtonsBlockButton: { backgroundColor: "#16161D", borderColor: "#2A2A35", color: "#EAEAF0" },
          socialButtonsBlockButtonText: { color: "#EAEAF0" },
          dividerLine: { backgroundColor: "#2A2A35" },
          dividerText: { color: "#7A7A8A" },
          formFieldLabel: { color: "#7A7A8A" },
          formFieldInput: { backgroundColor: "#16161D", borderColor: "#2A2A35", color: "#EAEAF0" },
          formFieldInputShowPasswordButton: { color: "#7A7A8A" },
          formButtonPrimary: { backgroundColor: "#6EE7A0", color: "#0F0F14" },
          formButtonReset: { color: "#6EE7A0" },
          footerAction: { color: "#7A7A8A" },
          footerActionLink: { color: "#6EE7A0" },
          footerActionText: { color: "#7A7A8A" },
          identityPreview: { backgroundColor: "#16161D", borderColor: "#2A2A35" },
          identityPreviewText: { color: "#EAEAF0" },
          identityPreviewEditButton: { color: "#6EE7A0" },
          otpCodeFieldInput: { backgroundColor: "#16161D", borderColor: "#2A2A35", color: "#EAEAF0" },
          alertText: { color: "#EAEAF0" },
          badge: { backgroundColor: "#16161D", color: "#7A7A8A" },
          // Hide the "Development mode" badge and Clerk branding
          internal: { display: "none" },
          footer: { "& > div:last-child": { display: "none" } },
        },
      }}
    >
      <html
        lang="en"
        className={`dark ${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <TooltipProvider>
            <SmoothScroll />
            <Navbar />
            <main className="flex-1">{children}</main>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
