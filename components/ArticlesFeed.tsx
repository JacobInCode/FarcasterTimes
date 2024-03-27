// 'use client';

import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown'
import Link from 'next/link';
import Image from 'next/image';
import { inter } from '@/app/fonts';
import { cn } from '@/lib/utils';
import { Article } from '@/types';

function sliceAtNextSpace(str: string, limit: number) {
    if (str.length <= limit) return str;

    // Find the position to slice, starting from the limit
    let slicePosition = str.substring(0, limit).lastIndexOf(' ');

    // If there's no space before the limit, try finding the next space after the limit
    if (slicePosition === -1 || slicePosition < limit) {
        let nextSpacePosition = str.indexOf(' ', limit);
        slicePosition = nextSpacePosition !== -1 ? nextSpacePosition : limit;
    }

    return str.substring(0, slicePosition);
}

function estimateReadingTime(text: string): number {
    const averageWordsPerMinute = 225;
    const averageEnglishWordLength = 5;

    // Calculate total words by dividing the text length by average word length
    const totalWords = text.length / averageEnglishWordLength;

    // Calculate reading time in minutes
    const readingTimeMinutes = totalWords / averageWordsPerMinute;

    // Round up to ensure reading time is at least 1 minute for short texts
    return Math.ceil(readingTimeMinutes);
}

const ArticlesFeed: React.FC<{ articles: Article[] | null, channelId: string }> = ({ articles: loadedArticles, channelId }) => {

    const endNumber = 9;
    const loadedArticlesFirstNine = loadedArticles?.slice(0, endNumber) || [];
    const loadedArticlesAfterNine = loadedArticles?.slice(endNumber, loadedArticles.length) || [];

    return (
        <div className='min-h-screen'>
            <div className='block lg:hidden'>
                {loadedArticles === null ? (
                    <p className='pt-10'>Loading daily articles... This could take several minutes.</p>
                ) : (
                    <div className='flex space max-w-7xl'>
                        <div className=''>
                            {loadedArticles.map((article, idx) => (
                                <ArticleComponentSmall key={article.id} article={article} idx={idx} isLastIndex={idx === loadedArticles.length - 1} />
                            ))}
                        </div>
                    </div>

                )}
            </div>
            <div className='hidden lg:block'>
                <div className='flex flex-col max-w-7xl'>
                    <div className='flex space max-w-7xl'>
                        <div className='w-2/3 border-r pr-4'>
                            {loadedArticlesFirstNine.slice(0, loadedArticlesFirstNine.length * 2 / 3).filter((_, idx) => idx % 2 === 0).map((article, idx) => (
                                <ArticleComponent key={article.id} article={article} nextArticle={loadedArticlesFirstNine?.slice(0, loadedArticlesFirstNine.length * 2 / 3).filter((_, idx) => idx % 2 !== 0)?.[idx]} idx={idx} isLastIndex={idx === loadedArticlesFirstNine.slice(0, loadedArticlesFirstNine.length * 1 / 3).length - 1} />
                            ))}
                        </div>
                        <div className='w-1/3 pl-4'>
                            {loadedArticlesFirstNine.slice(loadedArticlesFirstNine.length * 2 / 3, loadedArticlesFirstNine.length).map((article, idx) => (
                                <ArticleComponentSmall key={article.id} article={article} idx={idx} isLastIndex={idx === loadedArticlesFirstNine.slice(loadedArticlesFirstNine.length * 2 / 3, loadedArticlesFirstNine.length).length - 1} />
                            ))}
                        </div>
                    </div>
                    <div className='grid grid-cols-5 w-full mt-20'>
                        {loadedArticlesAfterNine.slice(loadedArticlesAfterNine.length * 2 / 3, loadedArticlesAfterNine.length).map((article, idx) => (
                            <ArticleComponentGrid key={article.id} article={article} idx={idx} isLastIndex={idx === loadedArticlesAfterNine.slice(loadedArticlesAfterNine.length * 2 / 3, loadedArticlesAfterNine.length).length - 1} />
                        ))}
                    </div>
                </div>
                {/* )} */}
            </div>
        </div>

    );
};

interface ArticleComponentProps {
    article: Article;
    idx: number;
    isLastIndex?: boolean;
    nextArticle?: Article;
}

const ArticleComponentGrid: React.FC<ArticleComponentProps> = ({ article, idx, isLastIndex }) => {
    return (
        <div className='prose max-w-[200px] w-[200px] pb-6'>
            <div className={cn('flex-col flex space-y-4 my-0')}>
                <Link href={`/article/${article.id}`} className='no-underline'>
                    {<div className={cn('h-[200px] w-[200px] my-0 overflow-hidden relative z-0 bg-gray-100')}>
                        <Image src={`https://fthzoepekxipizxebefk.supabase.co/storage/v1/object/public/cover_photos/${article.image}`}
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
                    <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400')}>{estimateReadingTime(article.body)} MIN READ</p>
                </div>

            </div>
        </div>

    );
};

const ArticleComponentSmall: React.FC<ArticleComponentProps> = ({ article, idx, isLastIndex }) => {
    return (
        <div className='prose max-w-6xl pb-6'>
            <div className={cn('flex-col flex space-y-4 my-0', { 'border-b': !isLastIndex })}>
                <Link href={`/article/${article.id}`} className='no-underline'>

                    {<div className={cn('h-[180px] sm:h-[260px] md:h-[300px] lg:h-[260px] my-0 overflow-hidden relative z-0 bg-gray-100', { "lg:hidden": idx === 1 })}>
                        <Image src={`https://fthzoepekxipizxebefk.supabase.co/storage/v1/object/public/cover_photos/${article.image}`}
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
                    <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400')}>{estimateReadingTime(article.body)} MIN READ</p>
                </div>

            </div>
        </div>

    );
};

const ArticleComponent: React.FC<ArticleComponentProps> = ({ article, idx, isLastIndex, nextArticle }) => {
    return (
        <div className='prose max-w-4xl pb-4'>
            <div className='flex-col md:flex-row flex md:space-x-4 my-0'>
                <div className='md:w-full flex flex-col justify-start'>
                    <Link href={`/article/${article.id}`} className='no-underline'>

                        <h3 className='text-xl mt-0 leading-[1.5rem]'>{article.headline}</h3>
                        {/* <p className='prose text-sm leading-[1.2rem] mb-3'>{article.body.slice(0, 150)}...</p> */}
                        <Markdown className='prose prose text-sm leading-[1.2rem] mb-1.5'>
                            {sliceAtNextSpace(article.body, 150) + "..."}
                        </Markdown>
                        <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400')}>{estimateReadingTime(article.body)} MIN READ</p>
                    </Link>

                    {nextArticle && <Link href={`/article/${nextArticle.id}`} className='no-underline'>
                        <p className='prose text-sm font-bold text-black leading-[1.3rem] pt-5 mb-3 border-t mb-1.5'>{nextArticle.headline}</p>
                        <p className={cn(inter.className, 'prose text-[10px] mt-0 text-gray-400')}>{estimateReadingTime(nextArticle.body)} MIN READ</p>
                    </Link>
                    }
                </div>
                <Link href={`/article/${article.id}`} className='no-underline'>
                    <div className='shrink-0 md:w-[470px] md:h-[320px] my-0 overflow-hidden relative z-0 bg-gray-100'>
                        <Image src={`https://fthzoepekxipizxebefk.supabase.co/storage/v1/object/public/cover_photos/${article.image}`}
                            layout='fill'
                            objectFit='cover'
                            // placeholder="blur"
                            alt='' style={{ marginTop: 0, marginBottom: 0 }} />

                    </div>
                </Link>

            </div>
            {!isLastIndex && <div className='border-b border-black w-full pb-8' />}
        </div>

    );
};

export default ArticlesFeed;