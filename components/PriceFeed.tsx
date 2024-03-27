'use client';

import { inter } from '@/app/fonts';
import { cn } from '@/lib/utils';
import { symbols } from '@/lib/utils/config';
import { useState, useEffect } from 'react';

interface PriceFeedProps {
    prices: string[];
}

const PriceFeed = ({ prices }: PriceFeedProps) => {
    const [priceIndex, setPriceIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPriceIndex((prevIndex) => (prevIndex + 1) % prices.length);
        }, 10000); // 30 seconds

        return () => clearInterval(interval);
    }, [prices]);

    return (
        <div className={cn(inter.className, 'text-xs font-medium text-right')}>
            <span className='mr-2'>{symbols[priceIndex]}</span>${prices[priceIndex]}
        </div>
    );
};

export default PriceFeed;
