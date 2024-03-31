'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { inngest } from '@/app/inngest/client';
import Link from 'next/link';

interface ReceiveEmailProps {
    children: React.ReactNode;
    urls: string[];
    setUrls: (urls: (string | undefined)[]) => void;
};

function validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

const ReceiveEmail: React.FC<ReceiveEmailProps> = ({ children, urls, setUrls }) => {
    const [value, setValue] = useState<string>("");
    const [loading, setLoading] = useState<number | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [openSubscriber, setOpenSubscriber] = useState<boolean>(false);

    useEffect(() => {
        if (!openSubscriber) {
            // setUrls([undefined]);
            setValue("");
            setSuccess(false);
        }
    }, [openSubscriber]);

    const fetchData = async (buttonIdx: number) => {
        try {
            setLoading(buttonIdx);

            if (!validateEmail(value)) {
                setError("Invalid email address");
                return;
            }

            const response = await fetch('api/genCitizen', { // Use the correct endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any additional headers as needed, such as authorization headers
                },
                body: JSON.stringify({urls: urls, email: value}),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setSuccess(true);

        } catch (error) {
            console.error('Error fetching articles:', error);
            setError("An error occurred.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <Dialog open={openSubscriber} onOpenChange={() => setOpenSubscriber(!openSubscriber)}>
            <DialogTrigger asChild className='w-full'>{children}</DialogTrigger>
            <DialogContent>
                {success ? <Card className="border-0 flex-col w-full space-y-4 md:space-y-0 flex max-w-2xl p-5 rounded-sm shadow-none">
                    <CardHeader className="p-0 space-y-3 w-full">
                        <CardTitle>Your Citizen Generated Articles wil be ready in about 4 minutes.</CardTitle>
                        <CardDescription>
                            <Link href="/" className="underline">
                                Head back to the home page.
                            </Link>
                        </CardDescription>
                    </CardHeader> </Card> : <Card className="border-0 flex-col w-full space-y-4 md:space-y-0 flex max-w-2xl p-5 rounded-sm shadow-none">
                    <CardHeader className="p-0 space-y-3 w-full">
                        <CardTitle>Generate your Citizen Article</CardTitle>
                        <CardDescription>
                            Receive an email with a link to your generated article.
                        </CardDescription>
                        <CardDescription className='text-xs'>
                            You can also choose to not receive an email and view the article on the site when it finishes generating in about 4 mins.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4 px-0 pb-0">
                        {error && <p className="text-red text-xs">{error}</p>}
                        <Input
                            className="h-8 text-xs bg-gray-100"
                            placeholder="Email"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                            }}
                        />
                        <div className='flex space-x-2 w-full'>
                            <Button variant="secondary" className="h-8 bg-black text-white w-full" onClick={() => fetchData(1)}>
                                {loading === 1 && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />}
                                Receive Email
                            </Button>
                            <Button variant="secondary" className="h-8 bg-black text-white w-full" onClick={() => fetchData(2)}>
                                {loading === 2 && <Loader2Icon className="h-4 w-4 animate-spin mr-3" />}
                                Don't Receive Email
                            </Button>
                        </div>
                    </CardContent>
                </Card>}
            </DialogContent>
        </Dialog>
    );
};

export default ReceiveEmail;
