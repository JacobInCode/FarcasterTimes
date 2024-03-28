import React from 'react';
import { Article } from '@/types';
import { ArticleCardBig, ArticleCardGrid, ArticleCardSmall } from './ArticleCards';
import { createBrowserClient } from '@supabase/ssr';

export const revalidate = 0 // revalidate at most every hour

const ArticlesFeed: React.FC<{ channelId: string }> = async ({ channelId }) => {

    const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '');
    let articles = null;

    let query = supabaseAdmin
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(37);

    if (channelId !== 'all') {
        query = query.eq('channel_id', channelId);
    }

    try {
        const { data: latestArticles, error: articlesError } = await query

        if (articlesError) {
            console.error(articlesError);
        }

        articles = latestArticles;
    } catch (error) {
        console.error(error);
    }

    // organize articles by created_at but zero out the minutes and seconds for every article where citizen === false
    const mixedArticles = articles ? articles?.map((article: any) => {
        const date = new Date(article.created_at);
        if (article.citizen === false) {
            date.setMinutes(0);
            // make seconds a random amount between 0 and 59
            date.setSeconds(Math.floor(Math.random() * 60));
        }
        return { ...article, created_at: date };
    }) : null;

    // sort by created_at
    const sorted = mixedArticles ? mixedArticles?.sort((a: any, b: any) => b.created_at - a.created_at) : null;

    const loadedArticles = channelId === "all" ? sorted : articles;

    const endNumber = 9;
    const loadedArticlesFirstChunk = loadedArticles?.slice(0, endNumber) || [];
    const loadedArticlesLastChunk = loadedArticles?.slice(endNumber, loadedArticles.length) || [];

    return (
        <div className='min-h-screen'>
            {/* Mobile */}
            <div className='block lg:hidden'>
                {loadedArticles !== null &&
                    <div className='flex space max-w-7xl'>
                        <div className=''>
                            {loadedArticles.map((article, idx) => (
                                <ArticleCardSmall key={article.id} article={article} idx={idx} includeBorder={idx !== loadedArticles.length - 1} />
                            ))}
                        </div>
                    </div>
                }
            </div>
            {/* Desktop */}
            <div className='hidden lg:block'>
                <div className='flex flex-col max-w-7xl'>
                    <div className='flex space max-w-7xl'>
                        <div className='w-2/3 border-r pr-4'>
                            {loadedArticlesFirstChunk.slice(0, loadedArticlesFirstChunk.length * 2 / 3).filter((_, idx) => idx % 2 === 0).map((article, idx) => (
                                <ArticleCardBig key={article.id} article={article} nextArticle={loadedArticlesFirstChunk?.slice(0, loadedArticlesFirstChunk.length * 2 / 3).filter((_, idx) => idx % 2 !== 0)?.[idx]} idx={idx} includeBorder={idx !== loadedArticlesFirstChunk.slice(0, loadedArticlesFirstChunk.length * 1 / 3).length - 1} />
                            ))}
                        </div>
                        <div className='w-1/3 pl-4'>
                            {loadedArticlesFirstChunk.slice(loadedArticlesFirstChunk.length * 2 / 3, loadedArticlesFirstChunk.length).map((article, idx) => (
                                <ArticleCardSmall key={article.id} article={article} idx={idx} includeBorder={idx !== loadedArticlesFirstChunk.slice(loadedArticlesFirstChunk.length * 2 / 3, loadedArticlesFirstChunk.length).length - 1} />
                            ))}
                        </div>
                    </div>
                    <div className='grid grid-cols-5 w-full mt-20'>
                        {loadedArticlesLastChunk.slice(loadedArticlesLastChunk.length * 2 / 3, loadedArticlesLastChunk.length).map((article, idx) => (
                            <ArticleCardGrid key={article.id} article={article} idx={idx} />
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ArticlesFeed;