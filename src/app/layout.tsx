import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canton Supply Co. — Inventory",
  description: "Product catalog and inventory management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
