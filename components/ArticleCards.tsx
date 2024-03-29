// 'use client';

import React from 'react';
import Markdown from 'react-markdown'
import Link from 'next/link';
import Image from 'next/image';
import { inter } from '@/app/fonts';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { SUPABASE_IMAGE_URL } from '@/lib/utils/config';
import { channelLabel, sliceAtNextSpace } from '@/lib/utils/helpers';
import { Bot, Cpu, User } from 'lucide-react';

interface ArticleCardProps {
    article: Article;
    idx: number;
    includeBorder?: boolean;
    nextArticle?: Article;
}

export const generationIcon = (citizen?: boolean) => {
    return citizen ? <User className='h-2.5 w-2.5 text-gray-400 mr-1' /> : <Cpu className='h-2.5 w-2.5 text-gray-400 mr-1' />;
};

export const ArticleCardGrid: React.FC<ArticleCardProps> = ({ article }) => {
    return (
        <div className='prose max-w-[200px] w-[200px] pb-6'>
            <div className={cn('flex-col flex space-y-4 my-0')}>
                <Link href={`/article/${article.id}`} className='no-underline'>
                    {<div className={cn('h-[200px] w-[200px] my-0 overflow-hidden relative z-0 bg-gray-100')}>
                        <Image src={`${SUPABASE_IMAGE_URL}/${article.image}`}
                            // placeholder="blur"
                            layout='fill'
                            objectFit='cover'
                            alt='' style={{ marginTop: 0, marginBottom: 0 }}
                        />
                    </div>}
                </Link>
                <div className='flex flex-col justify-start'>
                    <Link href={`/article/${article.id}`} className='no-underline'>
                        <h3 className='text-sm mt-0 leading-[1.2rem]'>{article.headline}</h3>
                    </Link>
                    <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400 flex items-center')}>{generationIcon(article.citizen)}{channelLabel(article?.channel_id || '').toUpperCase()}</p>
                </div>
            </div>
        </div>

    );
};


export const ArticleCardSmall: React.FC<ArticleCardProps> = ({ article, idx, includeBorder }) => {
    return (
        <div className='prose max-w-6xl pb-6'>
            <div className={cn('flex-col flex space-y-4 my-0', { 'border-b': includeBorder })}>
                <Link href={`/article/${article.id}`} className='no-underline'>
                    {<div className={cn('h-[180px] sm:h-[260px] md:h-[300px] lg:h-[260px] my-0 overflow-hidden relative z-0 bg-gray-100', { "lg:hidden": idx === 1 })}>
                        <Image src={`${SUPABASE_IMAGE_URL}/${article.image}`}
                            // placeholder="blur"
                            layout='fill'
                            objectFit='cover'
                            alt='' style={{ marginTop: 0, marginBottom: 0 }}
                        />
                    </div>}
                </Link>
                <div className='flex flex-col justify-start'>
                    <Link href={`/article/${article.id}`} className='no-underline'>
                        <h3 className='text-xl mt-0 leading-[1.5rem]'>{article.headline}</h3>
                    </Link>
                    <Markdown className='prose prose text-sm leading-[1.2rem] mb-1.5'>
                        {sliceAtNextSpace(article.body, 150) + "..."}
                    </Markdown>
                    <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400 flex items-center')}>{generationIcon(article.citizen)}{channelLabel(article?.channel_id || '').toUpperCase()}</p>
                </div>
            </div>
        </div>

    );
};

export const ArticleCardBig: React.FC<ArticleCardProps> = ({ article, idx, includeBorder, nextArticle }) => {
    return (
        <div className='prose max-w-4xl pb-4'>
            <div className='flex-col md:flex-row flex md:space-x-4 my-0'>
                <div className='md:w-full flex flex-col justify-start'>
                    <Link href={`/article/${article.id}`} className='no-underline'>
                        <h3 className='text-xl mt-0 leading-[1.5rem]'>{article.headline}</h3>
                        <Markdown className='prose prose text-sm leading-[1.2rem] mb-1.5'>
                            {sliceAtNextSpace(article.body, 150) + "..."}
                        </Markdown>
                        <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400 flex items-center')}>{generationIcon(article.citizen)}{channelLabel(article?.channel_id || '').toUpperCase()}</p>
                    </Link>

                    {nextArticle && <Link href={`/article/${nextArticle.id}`} className='no-underline'>
                        <p className='prose text-sm font-bold text-black leading-[1.3rem] pt-5 mb-3 border-t mb-1.5'>{nextArticle.headline}</p>
                        <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400 flex items-center')}>{generationIcon(article.citizen)}{channelLabel(article?.channel_id || '').toUpperCase()}</p>
                    </Link>
                    }
                </div>
                <Link href={`/article/${article.id}`} className='no-underline'>
                    <div className='shrink-0 md:w-[470px] md:h-[320px] my-0 overflow-hidden relative z-0 bg-gray-100'>
                        <Image src={`${SUPABASE_IMAGE_URL}/${article.image}`}
                            layout='fill'
                            objectFit='cover'
                            alt='' style={{ marginTop: 0, marginBottom: 0 }} />
                    </div>
                </Link>

            </div>
            {includeBorder && <div className='border-b border-black w-full pb-8' />}
        </div>

    );
};