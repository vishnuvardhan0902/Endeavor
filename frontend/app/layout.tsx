import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Home from "./page";
import { SessionProvider } from "next-auth/react";
import { Providers } from "./Providers";
import { ConditionalNavbar } from "./components/ConditionalNavbar";
import { ServerStatusWrapper } from "./components/ServerStatusWrapper";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Endeavor",
  description: "Your learning and testing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ServerStatusWrapper>
            {/* Navbar is conditionally rendered - hidden on test page for full-screen exam experience */}
            <div className="min-h-screen flex flex-col">
              <ConditionalNavbar />
              <main className="flex-1">{children}</main>
            </div>
          </ServerStatusWrapper>
        </Providers>
      </body>
    </html>
  );
}
