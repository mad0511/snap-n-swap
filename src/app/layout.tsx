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
          colorNeutral: "#EAEAF0",
          borderRadius: "0.5rem",
          fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          card: "bg-[#0F0F14] border border-[#2A2A35] shadow-2xl shadow-black/50",
          headerTitle: "text-[#EAEAF0]",
          headerSubtitle: "text-[#7A7A8A]",
          socialButtonsBlockButton: "bg-[#16161D] border-[#2A2A35] text-[#EAEAF0] hover:bg-[#1E1E28]",
          formFieldInput: "bg-[#16161D] border-[#2A2A35] text-[#EAEAF0]",
          formButtonPrimary: "bg-[#6EE7A0] text-[#0F0F14] hover:bg-[#5CD88E]",
          footerActionLink: "text-[#6EE7A0] hover:text-[#5CD88E]",
          identityPreview: "bg-[#16161D] border-[#2A2A35]",
          userButtonPopoverCard: "bg-[#0F0F14] border border-[#2A2A35]",
          userButtonPopoverActionButton: "text-[#EAEAF0] hover:bg-[#1E1E28]",
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
