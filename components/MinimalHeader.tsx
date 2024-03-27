import React from 'react';
import Link from 'next/link';
import TitleLogo from './TitleLogo';

const MinimalHeader: React.FC = () => {
    return (
        <div className='w-full flex flex-col items-center justify-center bg-background'>
            <Link href="/" className='py-3 flex justify-center relative w-80 sm:w-96'>
                <TitleLogo className="w-32" />
            </Link>
            <div className="border-b w-full" />
        </div>
    );
};

export default MinimalHeader;
