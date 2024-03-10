import { Tinos } from 'next/font/google'
import Image from 'next/image';

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
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={tinos.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
        <div className='w-full fixed top-0 flex flex-col items-center justify-center bg-background md:px-36'>          

        <div className='pt-5 text-xs'>          
            A Balaji Srinivasan Bounty Inspired Creation
          </div>
          <div className='p-6 w-full flex justify-center border-b'>          
            <TitleLogo className="" />
          </div>
          <header className="flex justify-center items-center w-full h-10 bg-primary border-b mx-24 border-black">
            <h1 className="text-md font-bold">{"Ethereum News"}</h1>
          </header>
          <div className="w-full border-b mt-1 border-black"/>
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
