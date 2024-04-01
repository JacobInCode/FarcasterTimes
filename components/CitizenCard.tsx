'use client'

import React, { useEffect, useState } from "react";
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
import { Loader2Icon, PlusIcon, X } from "lucide-react";
import ReceiveEmail from "./ReceiveEmail";
import { set } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox"

// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";

const CitizenCard: React.FC = () => {

    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [error, setError] = React.useState<null | string>(null);
    const [urls, setUrls] = React.useState<(string | undefined)[]>([undefined]);
    const [checked, setChecked] = React.useState(false);
    const [uid, setUid] = React.useState<string | null>(null);
    const router = useRouter();
    const [attemptCount, setAttemptCount] = useState(0);
    // const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const maxAttempts = 20;

    useEffect(() => {
        const checkArticleStatus = async () => {
            if (attemptCount >= maxAttempts) {
                console.log("Maximum attempts reached. Stopping further checks.");
                setError("An error occurred.");
                setLoading(false);
                return; // Stop further execution if max attempts reached
            }

            try {
                const response = await fetch('api/fetchArticleByUid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uid }),
                });

                console.log('Checking article status...');

                if (!response.ok) {
                    console.error('HTTP error! status:', response.status);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                console.log('Article status:', data);

                if (data) {

                    const { id } = JSON.parse(data);
                    console.log('id', id);

                    // clearInterval(intervalId)
                    router.push(`/article/${id}`); // Redirect to the article page
                    return; // If article is ready, stop further execution. No need to clear interval as it will not set further.
                } else {
                    console.log('Article not ready yet. Will check again in 30 seconds.');
                    setTimeout(() => {
                        checkArticleStatus();
                    }, 30000); // Set up the interval to call checkArticleStatus every 30 seconds
        
                }
            } catch (error) {
                console.error('Error fetching article status:', error);
                // Assuming setError is a function that sets some error state
                //   setError("An error occurred.");
            } finally {
                setAttemptCount(attemptCount => attemptCount + 1); // Increment attempt count after each try
            }
        };

        if (uid) {
            setTimeout(() => {
                checkArticleStatus();
            }, 30000); // Set up the interval to call checkArticleStatus every 30 seconds

            // setIntervalId(interval); // Save the interval id to clear it later
        }
    }, [uid, attemptCount]); // Depend on uid and attemptCount to re-run the effect


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

    function validateEmail(email: string): boolean {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const fetchData = async () => {
        try {
            setLoading(true);

            // if (checked && !validateEmail(email)) {
            //     setError("Invalid email address");
            //     return;
            // }

            const uid = uuidv4()
            setUid(uid);

            console.log('uid', uid);

            const response = await fetch('api/generateCitizenArticle', { // Use the correct endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any additional headers as needed, such as authorization headers
                },
                body: JSON.stringify({ urls: urls, email, uid }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error('Error fetching articles:', error);
            setError("An error occurred.");
        } 
        
        // finally {
        //     setLoading(false);
        // }
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

                <p className="text-xs">Add up to 10 Warpcast cast urls to generate and publish an article. Estimated generation time is about 4 mins.</p>
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
                        {index !== 0 && <X className={cn("absolute hover:text-red-200 cursor-pointer right-0 top-2 text-gray-300 z-10 h-4 w-4 mr-2", { "pointer-events-none": loading })} onClick={() => subtractUrl(index)} />}
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
                {/* {loading && <p className="text-xs w-full text-center">This could take a few minutes. Don't close this page.</p>} */}
                {/* @ts-ignore */}
                {/* <ReceiveEmail urls={urls} setUrls={setUrls}> */}
                {/* </ReceiveEmail> */}
                <div className="w-full border-t py-1" />
                <div className="flex flex-col pb-2 border p-2 rounded space-y-3 bg-gray-300">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms1" onCheckedChange={() => setChecked(!checked)} />
                        <label
                            htmlFor="terms1"
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Get notified via email when your article is ready.
                        </label>
                        {/* <p className="text-xs text-muted-foreground">
                            Get notified via email when your article is ready.
                        </p> */}
                    </div>
                    {checked &&
                        <Input
                            className="h-8 text-xs bg-gray-200"
                            placeholder="Email (Optional)"
                            value={email}
                            disabled={loading}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    }
                </div>

                <Button disabled={urls.filter(u => !u).length > 0 || loading} variant={"secondary"} onClick={fetchData} className="h-8 bg-black text-white w-full">
                    {loading && <Loader2Icon className="h-4 w-4 animate-spin mr-3 text-gray-300" />}
                    Publish
                </Button>
            </CardContent>
        </Card>
    );
};

export default CitizenCard;
