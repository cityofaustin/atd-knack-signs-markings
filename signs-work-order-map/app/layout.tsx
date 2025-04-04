import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  // todo: what should this say
  title: "Signs and Markings Operations",
  description: "City of Austin Transportation Public Works",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
