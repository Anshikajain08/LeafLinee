
"use client "
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SevaChat from '@/components/SevaChat'; // Added SevaChat import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seva: Delhi Civic Assistant",
  description: "Sustainability assistant for the citizens of Delhi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        
        <main>{children}</main>
        
        {/* This container ensures Seva floats on top of everything */}
        <div className="fixed bottom-5 right-5 z-50">
          <SevaChat />
        </div>

        <Footer />
      </body>
    </html>
  );
}