'use client'

import React, { useState } from 'react';
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { callChatAPI, describeImage, fetchBulkCasts, fetchFeed, generateImage, submitArticles, writeArticle } from '@/lib/utils/fetch';
import { CastsResponse } from '@neynar/nodejs-sdk/build/neynar-api/v2';
import { formatArticleWithAuthorLinks, parseArticleToJSON, parseJSONStringHashes } from '@/lib/utils/helpers';
import { channels } from '@/lib/utils/config';

const Reload: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);

    const fetchData = async (channelId: string) => {
        try {
            setLoading(true);
            setLoadingChannelId(channelId);

            // GET RELEVANT CASTS
            const feedRes: any[] = await fetchFeed(channelId);

            const fetchedRelevantCasts = feedRes.filter((cast) => {
                    const castTimestamp = new Date(cast.timestamp);
                    const last24Hours = new Date();
                    last24Hours.setDate(last24Hours.getDate() - 10);
                    return castTimestamp > last24Hours;
                }).map((cast) => {
                    return {
                        cast_hash: cast.hash,
                        text: cast.text,
                        likes: cast.reactions.likes.length,
                    };
                });

            const castsWithOverTenLikes = fetchedRelevantCasts.filter((cast) => cast.likes > 10);

            const relevantCasts = JSON.stringify(castsWithOverTenLikes);

            // Organize cast hashes by topic
            let topicallySortedCastHashes = await callChatAPI(relevantCasts);

            // FETCH BULK CASTS
            const casts: CastsResponse[] = await fetchBulkCasts(parseJSONStringHashes(topicallySortedCastHashes));

            // FORMATTING
            const mappedCasts = casts.map((res) => res.result.casts.map((cast: any) => { return { cast: cast, text: cast.text, author_unique_username: cast.author.username, author_display_name: cast.author.display_name, author_id: cast.author.fid, cast_id: cast.hash } }))

            // ADD IMAGE DESCRIPTIONS TO ANY CASTS WITH IMAGES OR FRAMES

            // @ts-ignore
            const imageDescriptions = await Promise.all(mappedCasts.map(c => c.cast).map((cast: any) => {

                if (cast?.embeds[0]?.url && (cast.embeds[0]?.url.includes("png") || cast.embeds[0].url.includes("jpg") || cast.embeds[0].url.includes("jpeg") || cast.embeds[0].url.includes("gif"))) {
                    return describeImage(cast.embeds[0].url)
                } else if (cast?.embeds[1]?.url && (cast.embeds[1].url.includes("png") || cast.embeds[1].url.includes("jpg") || cast.embeds[1].url.includes("jpeg") || cast.embeds[1].url.includes("gif"))) {
                    return describeImage(cast.embeds[1].url)
                } else if (cast?.frames?.[0]?.image) {
                    return describeImage(cast.frames[0].image)
                } else {
                    return Promise.resolve(null)
                }

            }));

            const castsWithImageDescs = mappedCasts.map((cast: any, index: number) => {
                return { ...cast, text: `CAST TEXT: ${cast.text} ${!!imageDescriptions[index] ? "\n DESCRIPTION OF IMAGE INCLUDED IN CAST: " + imageDescriptions[index] : ""}` }
            })

            // WRITE ARTICLES
            const writtenArticles = await Promise.all(mappedCasts.map((casts: any[]) => writeArticle(JSON.stringify(castsWithImageDescs))));

            // FORMATTING
            const addedLinks = writtenArticles.filter(a => !!a).map((article: any) => formatArticleWithAuthorLinks(article));

            const finalArticles = addedLinks.map((article: string) => parseArticleToJSON(article)).map((article: any, index: number) => {
                return {
                    ...article,
                    sources: mappedCasts[index].map((cast: any) => { return { hash: cast.cast_id, username: cast.author_unique_username, fid: cast.author_id } }),
                    channel_id: channelId,
                };
            });


            // GENERATE IMAGES
            const finalArticlesWithImages = await Promise.all(finalArticles.map(async (article: any) => {
                const image = await generateImage(`Create an image to represent this newspaper headline : ${article.headline}`);
                return {
                    ...article,
                    image: image.imageUrl,
                };
            }))

            // SAVING
            await submitArticles(finalArticlesWithImages)

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
                <CardContent className="space-y-2 p-0 max-w-96">
                    {channels.map((channel) => (
                        <Button
                            key={channel.id}
                            disabled={loading}
                            variant={"secondary"}
                            className="h-8 bg-black text-white w-full"
                            onClick={() => fetchData(channel.id)}
                        >
                            {(loading && loadingChannelId === channel.id) && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />}
                            Reload {channel.label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default Reload;