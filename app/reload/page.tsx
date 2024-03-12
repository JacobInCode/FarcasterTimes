'use client'

import React, { useState } from 'react';
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { callChatAPI, fetchBulkCasts, fetchFeed, formatArticleWithAuthorLinks, generateImage, parseArticleToJSON, submitArticle, writeArticle } from '@/lib/utils/fetch';
import { FilterType } from '@neynar/nodejs-sdk';
import { CastsResponse, FeedResponse } from '@neynar/nodejs-sdk/build/neynar-api/v2';

const Reload: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);

    const fetchData = async (channelId: string) => {
        try {
            setLoading(true);
            setLoadingChannelId(channelId);
            console.log("HERE", channelId);
            // 1. Get all casts for channel for last 24 hours
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

            const feedRes: FeedResponse = await fetchFeed(channelId);

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

            if (topicOrganizedHashes.includes('```json')) {
                topicOrganizedHashes = topicOrganizedHashes.replace(/\`\`\`json\n|\`\`\`/g, '').trim()
                if (!!topicOrganizedHashes.match(/\[(.|\s)*?\]/)?.[0]) {
                    topicOrganizedHashes = topicOrganizedHashes.match(/\[(.|\s)*?\]/)?.[0]!;
                }
            }

            let parsedHashes = JSON.parse(topicOrganizedHashes);

            // 3. For each topic

            const castsRes: CastsResponse[] = await fetchBulkCasts(parsedHashes);

            const mappedAndFilteredCasts = castsRes.map((res) => res.result.casts.map((cast: any) => { return { text: cast.text, author_unique_username: cast.author.username, author_display_name: cast.author.display_name, author_id: cast.author.fid, cast_id: cast.hash } }))

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
                const image = await generateImage(`Create an image to represent this newspaper headline : ${article.headline}`);
                return {
                    ...article,
                    image: image.imageUrl,
                };
            }))

            console.log("PARSEDARTICLES", finalArticleObjectWithImages);
            // setArticles(finalArticleObject);

            await submitArticle(finalArticleObjectWithImages)
            
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
            setLoadingChannelId(null);
        }
    };

    return (
        <div className='mt-20 w-full flex items-center justify-center'>
            <Card className={cn("bg-gray-100 border-gray-200 max-w-2xl p-5 rounded-sm")}>
                {/* <CardHeader className="w-[300px] p-0 space-y-3">
                    <CardTitle>Citizen Journalism</CardTitle>
                    <CardDescription>The collection, dissemination, and analysis of news and information by the general public, especially by means of the internet.</CardDescription>
                </CardHeader> */}
                <CardContent className="space-y-2 p-0 max-w-96">
                    {/* <CardDescription className="font-medium">Use the open social graph of Farcaster to power your own journalism.</CardDescription> */}
                    <Button disabled={loading} variant={"secondary"} className="h-8 bg-black text-white w-full" onClick={() => fetchData("trending")}>{(loading && loadingChannelId === "trending") && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />} Reload Trending</Button>
                    <Button disabled={loading} variant={"secondary"} className="h-8 bg-black text-white w-full" onClick={() => fetchData("ethereum")}>{(loading && loadingChannelId === "ethereum") && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />} Reload Ethereum</Button>
                    <Button disabled={loading} variant={"secondary"} className="h-8 bg-black text-white w-full" onClick={() => fetchData("farcaster")}>{(loading && loadingChannelId === "farcaster") && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />} Reload Farcaster</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reload;