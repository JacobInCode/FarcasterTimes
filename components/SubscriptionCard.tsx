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
import Link from 'next/link';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface SubscriptionCardProps {
    children: React.ReactNode;
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ children }) => {
    const [value, setValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const fetchData = async () => {
    };

     // Preset demo data
  const [recipient] = useState<string>('jcbssmall@gmail.com');
  const [subject] = useState<string>('Demo Subject');
  const [text] = useState<string>('This is a demo text email body.');
  const [html] = useState<string>('<p>This is a <strong>demo HTML</strong> email body.</p>');

  const sendEmail = async () => {
    const emailData = {
      recipients: [recipient],
      subject,
      text,
      html,
    };

    try {
      const response = await fetch('api/email', { // Replace with your actual endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      console.log(result);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email.');
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

                        {loading && <p className="text-xs w-full text-center">This could take a few minutes. Don't close this page.</p>}
                        <Button variant="secondary" className="h-8 bg-black text-white w-full" onClick={sendEmail}>
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
