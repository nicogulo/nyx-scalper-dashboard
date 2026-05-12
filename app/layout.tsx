import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyx Scalper Dashboard",
  description: "Binance Futures Scalper — Real-time monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a1a] antialiased">
        {children}
      </body>
    </html>
  );
}
