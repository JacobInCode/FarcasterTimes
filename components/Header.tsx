import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { inter } from '@/app/fonts';
import { channels } from '@/lib/utils/config';
import TitleLogo from '@/components/TitleLogo';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AlignJustify, User } from 'lucide-react';
import PriceFeed from '@/components/PriceFeed';
import SubscriptionCard from './SubscriptionCard';

interface HeaderProps {
  prices: string[];
  channelId: string;
}

const Header: React.FC<HeaderProps> = async ({ prices, channelId }) => {

  return (
    <div className='w-full flex flex-col items-center justify-center bg-background max-w-6xl'>
      <div className={cn(inter.className, 'hidden md:block relative w-full text-center')}>
        <div className='pt-2 text-[11px] '>Internet Native</div>
        <div className='flex space-x-1 absolute right-0 top-2'>
          <SubscriptionCard>
            <div className={cn(inter.className, 'text-[10px] font-medium py-1 px-2 bg-black text-white rounded')}>Subscribe</div>
          </SubscriptionCard>
          <Link href="/citizen" className={cn(inter.className, 'text-[10px] font-medium py-1 px-2 bg-gray-500 text-white rounded')}>
            <button>Citizen</button>
          </Link>
        </div>
      </div>
      <div className='px-8 sm:px-32 py-3 lg:p-5 w-full flex justify-center border-b border-gray-200 relative'>
        <div className={"hidden md:inline absolute left-0 flex flex-col space-y-0.5 pl-3 md:px-0"}>
          <div className={cn(inter.className, 'text-xs font-bold')}>{format(new Date(), 'EEEE, MMMM d')}</div>
          <div className={cn(inter.className, 'text-xs')}>Today's Date</div>
        </div>
        <Link href="/" className='cursor-pointer'>
          <TitleLogo className="w-36 md:w-60" />
        </Link>
        <div className={"hidden md:inline absolute right-0 flex flex-col pt-3 items-end space-y-0.5 pl-3 md:px-0"}>
          <PriceFeed prices={prices} />
        </div>
      </div>
      <header className="hidden md:flex space-x-4 lg:space-x-6 flex-wrap justify-center items-center w-full max-w-full h-16 sm:h-12 bg-primary border-b sm:mx-24 border-black">
        {channels.map((channel) => (
          <Link key={channel.id} href={`/feed/${channel.id}`} className='flex space-x-2 items-center hover:underline'>
            <div className={cn(inter.className, "text-xs", { "font-bold underline": channelId === channel.id })}>{channel.label}</div>
          </Link>
        ))}
      </header>
      <div className='md:hidden h-0'>
        <Sheet>
          <SheetTrigger><AlignJustify className='h-4 w-4 absolute left-0 top-4' /></SheetTrigger>
          <SheetContent side="top" className='flex flex-col space-x-0 gap-0'>
            {channels.map((channel) => (
              <Link key={channel.id} href={`/feed/${channel.id}`} className='my-0 border-b border-black py-4 items-center hover:underline'>
                <div className={cn(inter.className, "text-xs")}>{channel.label}</div>
              </Link>
            ))}
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger><User className='h-4 w-4 absolute right-0 top-4' /></SheetTrigger>
          <SheetContent side="top" className='flex flex-col space-x-0 gap-0'>
            <Link href={`/profile`} className='my-0 border-b border-black py-4 items-center hover:underline'>
              <div className={cn(inter.className, "text-xs")}>Profile</div>
            </Link>
          </SheetContent>
        </Sheet>
      </div>
      <div className='md:hidden flex w-full pt-4 justify-between'>
        <div className={cn(inter.className, 'text-xs font-bold')}>{format(new Date(), 'E, MMM d')}</div>
        <PriceFeed prices={prices} />
      </div>
      <div className="hidden md:block w-full border-b mt-0.5 border-black" />
    </div>

  );
}

export default Header;