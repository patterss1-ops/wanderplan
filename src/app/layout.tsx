import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WanderPlan - Plan Your Perfect Trip Together",
  description: "Collaborative travel planning for couples and groups. Explore, plan, and book your dream trips with our intuitive anchor-based booking workflow.",
  keywords: ["travel planning", "trip planner", "collaborative travel", "vacation planning", "itinerary builder"],
  authors: [{ name: "WanderPlan" }],
  openGraph: {
    title: "WanderPlan - Plan Your Perfect Trip Together",
    description: "Collaborative travel planning for couples and groups.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
