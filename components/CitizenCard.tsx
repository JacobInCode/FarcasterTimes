'use client'

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { inter } from "@/app/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { generateCitizenArticle } from "@/lib/utils/fetch";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon, X } from "lucide-react";

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

    const fetchData = async () => {
        try {
            setLoading(true);
            // get hashes from urls 

            const filteredUrls = urls.filter((url) => url !== undefined);

            if (filteredUrls.length === 0 || filteredUrls.includes(undefined)) {
                setError(true);
                return;
            }

            // @ts-ignore
            const data = await generateCitizenArticle(filteredUrls);
            // route to article
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
                            disabled={loading}
                            onChange={(e) => {
                                const newUrls = [...urls];
                                newUrls[index] = e.target.value;
                                setUrls(newUrls as string[] | undefined[]);
                            }}
                        />
                        {index !== 0 && <X className={cn("absolute hover:text-red-200 cursor-pointer right-0 top-2 text-gray-300 z-10 h-4 w-4 mr-2", {"pointer-events-none": loading})} onClick={() => subtractUrl(index)} />}
                    </div>
                ))}
                <div className="flex justify-center w-full">
                    {urls.length < 10 && <Button
                        variant="ghost"
                        className="h-6 text-gray-500 text-[10px] p-0"
                        onClick={addUrl}
                        disabled={loading}
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
