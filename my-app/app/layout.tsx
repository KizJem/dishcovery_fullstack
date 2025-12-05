import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dishcovery - Discover Amazing Recipes",
  description: "Unlock a world of variety culinary recipes and unleash your inner chef with Dishcovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Poppins', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}

