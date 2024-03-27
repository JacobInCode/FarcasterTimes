import React from 'react';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
    return (
        <footer className={`flex flex-col space-y-0.5 justify-center items-center bg-background w-full max-w-6xl pt-24 ${className}`}>
            <div className="w-full border-b-2 border-gray-200" />
            <div className="w-full border-b border-gray-200" />
            <p className="text-[11px] pt-10">
                Created by <a className='font-medium' href="https://warpcast.com/stringtheory69" target="_blank">StringTheory69 -{'>'}</a>
            </p>
        </footer>
    );
};

export default Footer;
