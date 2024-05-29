import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MenuComp from "./components/menu";
import Footer from "./components/footer";

import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebiNux",
  description: "Application de gestion de serveur Linux.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-ca">
      <body>
        <Providers>
          <MenuComp />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
