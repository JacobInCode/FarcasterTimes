'use client'

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { inter } from "@/app/fonts";
import { cn, removeMarkdownLinks } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { describeImage, generateSpeech, generateImage, lookUpCastByHashOrWarpcastUrl, submitArticles, writeArticle } from "@/lib/utils/fetch";
import { useRouter } from "next/navigation";
import { Expand, ExpandIcon, Loader2Icon, Minimize, MinusCircle, PlusIcon, X } from "lucide-react";
import { CastResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { formatArticleWithAuthorLinks, parseArticleToJSON } from "@/lib/utils/helpers";

const CitizenCard: React.FC = () => {

    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [urls, setUrls] = React.useState<(string | undefined)[]>([undefined]);

    const addUrl = () => {
        if (urls.length < 10) {
            setUrls([...urls, undefined]);
        }
    }

    const subtractUrl = (index: number) => {
        if (urls.length > 1) {
            const newUrls = [...urls];
            newUrls.splice(index, 1);
            setUrls(newUrls);
        }
    }

    const channelId = 'citizen';

    const fetchData = async () => {
        try {
            setLoading(true);
            // get hashes from urls 

            const filteredUrls = urls.filter((url) => url !== undefined);

            if (filteredUrls.length === 0) {
                setError(true);
                return;
            }

            const castsRes: CastResponse[] = await lookUpCastByHashOrWarpcastUrl(filteredUrls as string[]);

            console.log(castsRes);
            const mappedAndFilteredCasts = castsRes.map(c => c.cast).map((cast: any) => { return { text: cast.text, author_unique_username: cast.author.username, author_display_name: cast.author.display_name, author_id: cast.author.fid, cast_id: cast.hash } })

            const imageDescriptions = await Promise.all(castsRes.map(c => c.cast).map((cast: any) => {

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

            const castsWithImageDescs = mappedAndFilteredCasts.map((cast: any, index: number) => {
                return { ...cast, text: `CAST TEXT: ${cast.text}${!!imageDescriptions[index] ? "\n DESCRIPTION OF IMAGE INCLUDED IN CAST: " + imageDescriptions[index] : ""}` }
            })

            const articleRes = await writeArticle(JSON.stringify(castsWithImageDescs));

            const parsedArticle = parseArticleToJSON(formatArticleWithAuthorLinks(articleRes));
            const finalArticleObject = {
                ...parsedArticle,
                sources: mappedAndFilteredCasts.map((cast: any) => { return { hash: cast.cast_id, username: cast.author_unique_username, fid: cast.author_id } }),
                channel_id: channelId,
            };

            const image = await generateImage(`Create an vibrant image to describe this headline: ${finalArticleObject.headline}`);
            const audio = await generateSpeech(`${finalArticleObject.headline}\n\n${removeMarkdownLinks(finalArticleObject.body)}`);

            const finalArticleObjectWithImage = {
                ...finalArticleObject,
                image: image.imageUrl,
                audio: audio.speechUrl
            };

            const { data } = await submitArticles([finalArticleObjectWithImage])

            // console.log("PARSEDARTICLES", data);
            router.push(`/article/${data[0].id}`);

        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cn(inter.className, "bg-gray-200 border-gray-300 flex-col w-full space-y-4 md:space-y-0 flex md:flex-row md:space-x-10 max-w-2xl p-5 rounded-sm")}>
            <CardHeader className="w-[300px] p-0 space-y-3">
                <CardTitle>Citizen Journalism</CardTitle>
                <CardDescription>The collection, dissemination, and analysis of news and information by the general public, especially by means of the internet.</CardDescription>
                <Link href="https://en.wikipedia.org/wiki/Citizen_journalism" target="_blank" className="text-sm font-semibold">Find out more -{">"}</Link>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
                <CardDescription className="font-medium">Use the open social graph of Farcaster to power your own journalism.</CardDescription>

                <p className="text-xs">Add up to 10 Warpcast cast urls to generate and publish an article.</p>
                {error && <p className="text-red text-xs">An error occured.</p>}
                {urls.map((_, index) => (
                    <div className="relative">
                        <Input
                            className="h-8 text-xs"
                            key={index}
                            placeholder="Warpcast URL"
                            value={urls[index]}
                            onChange={(e) => {
                                const newUrls = [...urls];
                                newUrls[index] = e.target.value;
                                setUrls(newUrls as string[] | undefined[]);
                            }}
                        />
                        {index !== 0 && <X className="absolute hover:text-red-200 cursor-pointer right-0 top-2 text-gray-300 z-10 h-4 w-4 mr-2" onClick={() => subtractUrl(index)} />}
                    </div>
                ))}
                <div className="flex justify-center w-full">
                    {urls.length < 10 && <Button
                        variant="ghost"
                        className="h-6 text-gray-500 text-[10px] p-0"
                        onClick={addUrl}
                    >
                        <PlusIcon className="h-3 w-3 mr-2" />
                        Add URL
                    </Button>}
                </div>
                {loading && <p className="text-xs w-full text-center">This could take a few minutes. Don't close this page.</p>}
                <Button variant={"secondary"} className="h-8 bg-black text-white w-full" onClick={fetchData}>{loading && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />} Publish</Button>
            </CardContent>
        </Card>
    );
};

export default CitizenCard;
