'use client'

import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import Image from 'next/image';
import { Article } from '@/types';
import { cn } from '@/lib/utils';
import { inter } from '@/app/fonts';
import { fetchArticle } from '@/lib/utils/fetch';
import { SUPABASE_IMAGE_URL } from '@/lib/utils/config';

const ArticlePage: React.FC<{ article: Article | null, id: string | null }> = ({ article: passedArticle, id }) => {
    const [article, setArticle] = useState<Article | null>(passedArticle);

    useEffect(() => {

        if (!id) return;

        const fetchArticleData = async () => {
            try {
                const data = await fetchArticle(id);
                setArticle(data);
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };

        fetchArticleData();
    }, []);

    if (!article) {
        return <div>Loading...</div>;
    }

    return (
        <div className='prose max-w-2xl'>
            <h1 className='text-xl md:text-3xl'>{article.headline}</h1>
            <div className='shrink-0 h-[200px] sm:h-[300px] md:w-full md:h-[400px] mt-4 mb-2 overflow-hidden relative z-0 '>
                <Image src={`${SUPABASE_IMAGE_URL}/${article.image}`}
                    layout='fill'
                    objectFit='cover'
                    alt='' style={{ marginTop: 0, marginBottom: 0 }} />
            </div>
            {article?.audio && (
                <div className="fixed left-4 bottom-4">
                    <audio controls src={`${SUPABASE_IMAGE_URL}/${article?.audio}`} className="shadow-lg rounded-full border border-gray-300" />
                </div>
            )}
            {article.created_at && <p className={cn(inter.className, 'text-[10px] w-full text-right')}>Generated {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
            <Markdown className='prose max-w-2xl'>
                {article.body}
            </Markdown>
            <p className='font-bold mb-1'>Source Casts</p>
            <div className='flex flex-wrap space-y-1 max-w-36'>
                {article.sources?.map((source) => (
                    <a href={`https://warpcast.com/${source.username}/${source.hash}`} target='_blank' rel='noreferrer'>
                        <p className='my-0 text-xs'>{`https://warpcast.com/${source.username}/${source.hash}`}</p>
                    </a>
                ))}
            </div>
        </div>

    );
};

export default ArticlePage;
