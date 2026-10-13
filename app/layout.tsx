import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: { default: "MemeReach — signal with receipts", template: "%s · MemeReach" },
  description: "Off-chain advertising infrastructure for Solana meme coin communities and crypto publishers.",
  openGraph: { title: "MemeReach — signal with receipts", description: "Measurable distribution for Solana-native projects.", type: "website", siteName: "MemeReach" },
  twitter: { card: "summary_large_image", title: "MemeReach — signal with receipts", description: "Measurable distribution for Solana-native projects." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
}
