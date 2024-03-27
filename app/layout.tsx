import { format } from 'date-fns';
import { tinos } from "./fonts";
import { Analytics } from "@vercel/analytics/react"

import "./globals.css";
import TitleLogo from '@/components/TitleLogo';
import { TailwindIndicator } from '@/components/TailwindIndicator';

const defaultUrl = process.env.VERCEL_URL
  ? `https://citizentimes.xyz`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Citizen Times",
  description: "Automated news generation for internet natives",
  openGraph: {
    images: ['https://citizentimes.xyz/opengraph-image.png'],
    width: 1200,
    height: 600,
  },
  // image: new URL("/opengraph-image.png", defaultUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <html lang="en" className={tinos.className}>
      <body className="bg-background text-foreground px-4">
        <main className="min-h-screen flex flex-col items-center">
          {children}
          <TailwindIndicator />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
