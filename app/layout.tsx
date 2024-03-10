import { Tinos } from 'next/font/google'
import { format } from 'date-fns';

// If loading a variable font, you don't need to specify the font weight
const tinos = Tinos({
  subsets: ['latin'],
  style: 'normal',
  weight: ["400", "700"],
})

import "./globals.css";
import TitleLogo from '@/components/TitleLogo';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fully Automated Laissez-Faire Journalism",
  description: "Automated news generation for internet natives",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <html lang="en" className={tinos.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
