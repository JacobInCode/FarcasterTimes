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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatArticleWithAuthorLinks, generateImage, lookUpCastByHashOrWarpcastUrl, parseArticleToJSON, submitArticle, writeArticle } from "@/lib/utils/fetch";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";

const CitizenCard: React.FC = () => {

    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [urls, setUrls] = React.useState<string[] | undefined[]>([undefined, undefined, undefined]);

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

            // const castsRes = await Promise.all(parsedHashes.map(res => res.cast.).map((hashes: string[]) => client.fetchBulkCasts(hashes)));
            
            console.log(castsRes);
            const mappedAndFilteredCasts = castsRes.map(c => c.cast).map((cast: any) => { return { text: cast.text, author_unique_username: cast.author.username, author_display_name: cast.author.display_name, author_id: cast.author.fid, cast_id: cast.hash } })
            // console.log(castsRes.map((res) => res.result.casts.map((cast: any) => {return {text: cast.text, author_display_name: cast.author.display_name, author_id: cast.author.fid, post_id: cast.hash}})));

            const articleRes = await writeArticle(JSON.stringify(mappedAndFilteredCasts));

            console.log(articleRes);

            // const addedLinks = articlesRes.filter(a => !!a).map((article: any) => formatArticleWithAuthorLinks(article));

            const parsedArticle = parseArticleToJSON(formatArticleWithAuthorLinks(articleRes));
            const finalArticleObject = {
                    ...parsedArticle,
                    sources: mappedAndFilteredCasts.map((cast: any) => { return { hash: cast.cast_id, username: cast.author_unique_username, fid: cast.author_id } }),
                    channel_id: channelId,
                };

            const image = await generateImage(`Create an image to represent this newspaper headline : ${finalArticleObject.headline}`);

            const finalArticleObjectWithImage = {
                    ...finalArticleObject,
                    image: image.imageUrl,
                };
            

            const {data} = await submitArticle([finalArticleObjectWithImage])

            console.log("PARSEDARTICLES", data);    
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

                <p className="text-xs">Add up to three Warpcast cast urls to generate and publish an article.</p>
                {error && <p className="text-red text-xs">An error occured.</p>}
                {urls.map((url, index) => (
                    <Input className="h-8 text-xs" key={index} placeholder="Warpcast URL" value={url} onChange={(e) => {
                        const newUrls = [...urls];
                        newUrls[index] = e.target.value;
                        setUrls(newUrls as string[] | undefined[]);
                    }}
                  />))}
                    {loading && <p className="text-xs w-full text-center">This could take a few minutes. Don't close this page.</p>}
                <Button variant={"secondary"} className="h-8 bg-black text-white w-full" onClick={fetchData}>{loading && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />} Publish</Button>
            </CardContent>
        </Card>
    );
};

export default CitizenCard;
