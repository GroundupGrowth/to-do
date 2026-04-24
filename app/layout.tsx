import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM",
  description: "Personal project management for a solo operator.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
