import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Form Builder",
  description: "Visual drag-and-drop form builder for developers",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={montserrat.variable}>
    <body className="bg-background text-foreground">{children}</body>
  </html>
);

export default RootLayout;
