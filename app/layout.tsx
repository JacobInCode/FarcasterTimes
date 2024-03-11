import { format } from 'date-fns';
import { tinos } from "./fonts";
import { Analytics } from "@vercel/analytics/react"

import "./globals.css";
import TitleLogo from '@/components/TitleLogo';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fully Automated Laissez-Faire Journalism",
  description: "Automated news generation for internet natives",
  openGraph: {
    images: ['https://falfj.com/opengraph-image.png'],
  },
  // image: new URL("/opengraph-image.png", defaultUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <html lang="en" className={tinos.className}>
      <body className="bg-background text-foreground px-4">
        <main className="min-h-screen flex flex-col items-center">
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
