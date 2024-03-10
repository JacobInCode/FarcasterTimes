'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NeynarAPIClient, FilterType } from "@neynar/nodejs-sdk";
import { set } from 'zod';
import Markdown from 'react-markdown'
import Link from 'next/link';
import Image from 'next/image';

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

async function generateImage(prompt: string): Promise<any> {
    try {
        const response = await fetch('/api/image', { // Replace '/api/your-endpoint' with the actual endpoint path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        return data;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

async function submitArticle(articles: Article[]) {
    try {
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as necessary, e.g., for CSRF protection or authentication
            },
            body: JSON.stringify(articles),
        });

        if (!response.ok) {
            // Handle server errors or validation errors
            const errorData = await response.json();
            console.error('Server responded with an error:', errorData);
            return { error: true, data: errorData };
        }

        // Successfully added the article
        const newArticle = await response.json();
        console.log('Article submitted successfully:', newArticle);
        return { error: false, data: newArticle };
    } catch (error) {
        // Handle network errors
        console.error('Failed to submit article:', error);
        return { error: true, data: error };
    }
}


function parseArticleToJSON(articleText: string): Article {
    // Split the text by "Article:" to separate the headline and article.
    const [headlinePart, articlePart] = articleText.split("\n\nArticle:\n\n");

    // Remove the "Headline:" prefix and trim any leading/trailing whitespace.
    const headline = headlinePart.replace("Headline: ", "").trim();

    // Trim the article part to remove any leading/trailing whitespace.
    const body = articlePart.trim();

    return { headline, body };
}

function formatArticleWithAuthorLinks(article: string): string {
    const authorRegex = /\(AUTHOR: ([^\)]+)\)/g;

    return article.replace(authorRegex, (match, username) => {
        return `[${match.replace('(AUTHOR: ', '').replace(')', '')}](https://warpcast.com/${username})`;
    });
}

async function writeArticle(casts: string) {
    const requestBody = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "system",
                "content": "You are a veteran journalist who has worked at the New York Times for years. Your writing is marked by a stark originality and concision, consistently eschewing the predictable and the overwrought in favor of the straightforward and genuine.\n\nYou are writing an article in the style of the New York Times about a series of related Farcaster casts. \n\nYour response should be formatted like this :\nHeadline : headline goes here\nArticle : Article goes here\n\n If you mention an author always follow their name with (AUTHOR: author_unique_username goes here)"
            },
            {
                "role": "user",
                "content": "Write an article in the style of the new york times about the following Farcaster casts. \n \nThese are the casts: " + casts
            }
        ],
        "temperature": 0.4,
        "max_tokens": 4095,
        "top_p": 0.18,
        "frequency_penalty": 0,
        "presence_penalty": 0.31
    };

    try {
        const response = await fetch('/api/generate', { // Use the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any additional headers as needed, such as authorization headers
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        // If your response is a stream, handle accordingly
        return data;
    } catch (error) {
        console.error('Error calling the API:', error);
    }
}

async function callChatAPI(casts: string) {
    const requestBody = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "system",
                "content": "You are a serverside function that returns JSON. Always return an array of arrays of cast hashes. Each subarray should be organized by casts with text that is similar to each other. Example output: [[0x12345..., 0x78910...]]. Do not include \n characters in your output."
            },
            {
                "role": "user",
                "content": `These are the casts: ${casts}. Return an array of arrays of cast hashes. Each array should contain casts with text that is similar to each other.`
            },
            {
                "role": "assistant",
                "content": ""
            }
        ],
        "temperature": 0.15,
        "max_tokens": 4095,
        "top_p": 0.1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    };

    try {
        const response = await fetch('/api/generate', { // Use the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any additional headers as needed, such as authorization headers
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        // If your response is a stream, handle accordingly
        return data;
    } catch (error) {
        console.error('Error calling the API:', error);
    }
}

const ArticlesFeed: React.FC<{ articles: Article[] | null }> = ({ articles: loadedArticles }) => {
    const client = new NeynarAPIClient('F27ECCFC-2E15-40B4-AB89-A6A595804D7F');
    const [articles, setArticles] = useState<Article[] | null>(loadedArticles);
    const channelId = "ethereum";
    const intialLoad = useRef(true);

    useEffect(() => {
        if (articles === null && intialLoad.current) {
            fetchData();
            intialLoad.current = false;
        }
    }, [articles]);


    const fetchData = async () => {
        try {

            // 1. Get all casts for channel for last 24 hours
            const feedRes = await client.fetchFeed('filter', {
                filterType: FilterType.ChannelId,
                channelId: "ethereum",
                withRecasts: true,
                withReplies: true,
                limit: 100
            });

            console.log("HERE", feedRes);

            const mappedCasts = feedRes.casts
                .filter((cast) => {
                    const castTimestamp = new Date(cast.timestamp);
                    const last24Hours = new Date();
                    last24Hours.setDate(last24Hours.getDate() - 10);
                    return castTimestamp > last24Hours;
                })
                .map((cast) => {
                    return {
                        cast_hash: cast.hash,
                        text: cast.text,
                        likes: cast.reactions.likes.length,
                    };
                });

            const filteredCasts = mappedCasts.filter((cast) => cast.likes > 10);

            console.log(filteredCasts);

            const casts = JSON.stringify(filteredCasts);

            // 2. Organize cast hashes by topic
            let topicOrganizedHashes = await callChatAPI(casts);
            // console.log(preprocessJsonString(topicOrganizedHashes));

            if (topicOrganizedHashes.includes('```json')) {
                topicOrganizedHashes = topicOrganizedHashes.replace(/\`\`\`json\n|\`\`\`/g, '').trim().match(/\[(.|\s)*?\]/)
            }

            let parsedHashes = JSON.parse(topicOrganizedHashes)

            console.log(parsedHashes);

            // 3. For each topic

            const castsRes = await Promise.all(parsedHashes.map((hashes: string[]) => client.fetchBulkCasts(hashes)));
            const mappedAndFilteredCasts = castsRes.map((res) => res.result.casts.map((cast: any) => { return { text: cast.text, author_unique_username: cast.author.username, author_display_name: cast.author.display_name, author_id: cast.author.fid, cast_id: cast.hash } }))
            // console.log(castsRes.map((res) => res.result.casts.map((cast: any) => {return {text: cast.text, author_display_name: cast.author.display_name, author_id: cast.author.fid, post_id: cast.hash}})));

            const articlesRes = await Promise.all(mappedAndFilteredCasts.map((casts: any[]) => writeArticle(JSON.stringify(casts))));

            console.log(articlesRes);

            const addedLinks = articlesRes.filter(a => !!a).map((article: any) => formatArticleWithAuthorLinks(article));

            const parsedArticles = addedLinks.map((article: string) => parseArticleToJSON(article));
            const finalArticleObject = parsedArticles.map((article: any, index: number) => {
                return {
                    ...article,
                    sources: mappedAndFilteredCasts[index].map((cast: any) => { return { hash: cast.cast_id, username: cast.author_unique_username, fid: cast.author_id } }),
                    channel_id: channelId,
                };
            });

            const finalArticleObjectWithImages = await Promise.all(finalArticleObject.map(async (article: any) => {
                const image = await generateImage(`Create an image that could be a New York Times cover photo for this headline : ${article.headline}`);
                return {
                    ...article,
                    image: image.imageUrl,
                };
            }))


            // const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
            // //supabase method to save articles to db
            // const { data, error } = await supabaseAdmin
            // .from('articles')
            // .insert(parsedArticles)
            // .single();

            console.log("PARSEDARTICLES", finalArticleObjectWithImages);
            setArticles(finalArticleObject);

            await submitArticle(finalArticleObjectWithImages)

            // Usage:
            // const articles = await fetchArticlesForTopics(topics);
            // setArticles(articles);

            // setArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    return (
        <div>
            {articles === null ? (
                <p>Loading articles...</p>
            ) : (
                articles.map((article) => (
                    <ArticleComponent key={article.id} article={article} />
                ))
            )}
        </div>
    );
};

interface Article {
    id?: number;
    headline: string;
    body: string;
    sources?: any[];
    readTime?: number;
    image?: string;
}

interface ArticleComponentProps {
    article: Article;
}

const ArticleComponent: React.FC<ArticleComponentProps> = ({ article }) => {
    return (
        <Link href={`/article/${article.id}`} className='no-underline'>
            <div className='prose max-w-2xl py-0 px-8'>
                <div className='flex-col md:flex-row flex md:space-x-10 my-0'>
                    <div className='md:w-1/2'>
                        <h3 className='text-xl'>{article.headline}</h3>
                        <p className='prose text-sm'>{article.body.slice(0, 300)}...</p>
                        <p className='prose text-xs'>{estimateReadingTime(article.body)} MIN READ</p>
                    </div>
                    <div className='md:w-1/2 my-0'>
                        <Image src={`https://fthzoepekxipizxebefk.supabase.co/storage/v1/object/public/cover_photos/${article.image}`} alt={article.headline} width={500} // These should be your image's intrinsic dimensions or your layout's requirements
                            height={500}
                            layout="responsive" />
                    </div>

                </div>
            </div>
        </Link>

    );
};

export default ArticlesFeed;