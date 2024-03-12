// 'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NeynarAPIClient, FilterType } from "@neynar/nodejs-sdk";
import { set } from 'zod';
import Markdown from 'react-markdown'
import Link from 'next/link';
import Image from 'next/image';
import { inter } from '@/app/fonts';
import { cn } from '@/lib/utils';
import CitizenCard from './CitizenCard';
import router from 'next/navigation';
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
    // const [articles, setArticles] = useState<Article[] | null>([]);

    // useEffect(() => {
    //     if (loadedArticles) {
    //         setArticles(loadedArticles);
    //     }
    // }, [loadedArticles]);

    // const intialLoad = useRef(true);

    // useEffect(() => {
    //     console.log("FETCHING", articles);

    //     if (articles === null && intialLoad.current) {
    //         console.log("FETCHING", articles);
    //         fetchData();
    //         intialLoad.current = false;
    //     }
    // }, [articles]);

    const fetchData = async () => {
        try {

            // console.log("HERE", channelId);
            // // 1. Get all casts for channel for last 24 hours
            // let feedRes;
            // if (channelId === 'trending') {
            //     feedRes = await client.fetchFeed('filter', {
            //         filterType: FilterType.GlobalTrending,
            //         // channelId,
            //         withRecasts: true,
            //         withReplies: true,
            //         limit: 100
            //     });
            // } else {
            //     feedRes = await client.fetchFeed('filter', {
            //         filterType: FilterType.ChannelId,
            //         channelId,
            //         withRecasts: true,
            //         withReplies: true,
            //         limit: 100
            //     });
            // }

            // console.log("HERE", feedRes);

            // const mappedCasts = feedRes.casts
            //     .filter((cast) => {
            //         const castTimestamp = new Date(cast.timestamp);
            //         const last24Hours = new Date();
            //         last24Hours.setDate(last24Hours.getDate() - 10);
            //         return castTimestamp > last24Hours;
            //     })
            //     .map((cast) => {
            //         return {
            //             cast_hash: cast.hash,
            //             text: cast.text,
            //             likes: cast.reactions.likes.length,
            //         };
            //     });

            // const filteredCasts = mappedCasts.filter((cast) => cast.likes > 10);

            // console.log(filteredCasts);

            // const casts = JSON.stringify(filteredCasts);

            // // 2. Organize cast hashes by topic
            // let topicOrganizedHashes = await callChatAPI(casts);
            // // console.log(preprocessJsonString(topicOrganizedHashes));

            // if (topicOrganizedHashes.includes('```json')) {
            //     topicOrganizedHashes = topicOrganizedHashes.replace(/\`\`\`json\n|\`\`\`/g, '').trim().match(/\[(.|\s)*?\]/)
            // }

            // let parsedHashes = JSON.parse(topicOrganizedHashes)

            // console.log(parsedHashes);

            // // 3. For each topic

            // const castsRes = await Promise.all(parsedHashes.map((hashes: string[]) => client.fetchBulkCasts(hashes)));
            // const mappedAndFilteredCasts = castsRes.map((res) => res.result.casts.map((cast: any) => { return { text: cast.text, author_unique_username: cast.author.username, author_display_name: cast.author.display_name, author_id: cast.author.fid, cast_id: cast.hash } }))
            // // console.log(castsRes.map((res) => res.result.casts.map((cast: any) => {return {text: cast.text, author_display_name: cast.author.display_name, author_id: cast.author.fid, post_id: cast.hash}})));

            // const articlesRes = await Promise.all(mappedAndFilteredCasts.map((casts: any[]) => writeArticle(JSON.stringify(casts))));

            // console.log(articlesRes);

            // const addedLinks = articlesRes.filter(a => !!a).map((article: any) => formatArticleWithAuthorLinks(article));

            // const parsedArticles = addedLinks.map((article: string) => parseArticleToJSON(article));
            // const finalArticleObject = parsedArticles.map((article: any, index: number) => {
            //     return {
            //         ...article,
            //         sources: mappedAndFilteredCasts[index].map((cast: any) => { return { hash: cast.cast_id, username: cast.author_unique_username, fid: cast.author_id } }),
            //         channel_id: channelId,
            //     };
            // });

            // const finalArticleObjectWithImages = await Promise.all(finalArticleObject.map(async (article: any) => {
            //     const image = await generateImage(`Create an image to represent this newspaper headline : ${article.headline}`);
            //     return {
            //         ...article,
            //         image: image.imageUrl,
            //     };
            // }))


            // // const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
            // // //supabase method to save articles to db
            // // const { data, error } = await supabaseAdmin
            // // .from('articles')
            // // .insert(parsedArticles)
            // // .single();

            // console.log("PARSEDARTICLES", finalArticleObjectWithImages);
            // // setArticles(finalArticleObject);

            // await submitArticle(finalArticleObjectWithImages)
            
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='block lg:hidden'>
                {loadedArticles === null ? (
                    <p className='pt-10'>Loading daily articles... This could take several minutes.</p>
                ) : (
                    <div className='flex space max-w-7xl'>
                        <div className=''>
                            {channelId === 'citizen' && <div className='py-6 flex justify-center w-full'><CitizenCard /></div>}
                            {loadedArticles.map((article, idx) => (
                                <ArticleComponentSmall key={article.id} article={article} idx={idx} isLastIndex={idx === loadedArticles.length - 1} />
                            ))}
                        </div>
                    </div>

                )}
            </div>
            <div className='hidden lg:block'>
                {loadedArticles === null ? (
                    channelId === 'citizen' ? <CitizenCard /> : <p className='pt-10'>Loading daily articles... This could take several minutes.</p>
                ) : (
                    <div className='flex space max-w-7xl'>
                        <div className='w-2/3 border-r pr-4'>
                            {channelId === 'citizen' && <div className='p-8 bg-gray-100 border border-gray-200 mb-4'><CitizenCard /></div>}
                            {loadedArticles.slice(0, loadedArticles.length * 2 / 3).filter((_, idx) => idx % 2 === 0).map((article, idx) => (
                                <ArticleComponent key={article.id} article={article} nextArticle={loadedArticles?.slice(0, loadedArticles.length * 2 / 3).filter((_, idx) => idx % 2 !== 0)?.[idx]} idx={idx} isLastIndex={idx === loadedArticles.slice(0, loadedArticles.length * 1 / 3).length - 1} />
                            ))}
                        </div>
                        <div className='w-1/3 pl-4'>
                            {loadedArticles.slice(loadedArticles.length * 2 / 3, loadedArticles.length).map((article, idx) => (
                                <ArticleComponentSmall key={article.id} article={article} idx={idx} isLastIndex={idx === loadedArticles.slice(loadedArticles.length * 2 / 3, loadedArticles.length).length - 1} />
                            ))}
                        </div>
                    </div>

                )}
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