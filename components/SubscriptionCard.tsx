'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from './ui/button';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { generateEmailHTML } from '@/lib/utils/helpers';
import { getTopFiveArticles } from '@/lib/utils/fetch';

// Example usage:
const articles = [
    { headline: "Headline of Article 1", body: "This is a one-sentence body paragraph for Article 1.", id: "123" },
    { headline: "Headline of Article 2", body: "This is a one-sentence body paragraph for Article 2.", id: "456" },
    // Add more articles as needed
];

interface SubscriptionCardProps {
    children: React.ReactNode;
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ children }) => {
    const [value, setValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const addEmail = async () => {

        if (!value) {
            return;
        }

        setLoading(true);

        // const topFive = await getTopFiveArticles();

        // console.log(topFive);    

        // const emailData = {
        //     recipients: [recipient],
        //     subject,
        //     text,
        //     html: generateEmailHTML(topFive.map((article: any) => ({ headline: article.headline, body: article.body.slice(0, 75), id: article.id }))),
        // };

        try {
            const response = await fetch('api/addSubscriber', { // Replace with your actual endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: value }),
            });

            const result = await response.json();
            console.log(result);
            alert('Subscribed successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <Card className="border-0 flex-col w-full space-y-4 md:space-y-0 flex max-w-2xl p-5 rounded-sm">
                    <CardHeader className="p-0 space-y-3 w-full">
                        <CardTitle>Subscribe to Citizen Times</CardTitle>
                        <CardDescription>
                            Subscribe to Citizen Times to get the latest news and updates.
                        </CardDescription>
                        {/* <Link href="https://en.wikipedia.org/wiki/Citizen_journalism" target="_blank" className="text-sm font-semibold">
                            Find out more -&gt;
                        </Link> */}
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4 px-0 pb-0">
                        {/* <p className="text-xs">Add up to 10 Warpcast cast urls to generate and publish an article.</p> */}
                        {error && <p className="text-red text-xs">An error occurred.</p>}
                        <Input
                            className="h-8 text-xs bg-gray-100"
                            placeholder="Email"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                            }}
                        />
                        <Button variant="secondary" className="h-8 bg-black text-white w-full" onClick={addEmail}>
                            {loading && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />}
                            Subscribe
                        </Button>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionCard;
