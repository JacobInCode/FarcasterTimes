'use client'

import React, { useState } from 'react';
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { organizeHashesByTopic, describeImage, fetchBulkCasts, fetchFeed, generateImage, submitArticles, writeArticle, generateArticle } from '@/lib/utils/fetch';
import { CastsResponse } from '@neynar/nodejs-sdk/build/neynar-api/v2';
import { formatArticleWithAuthorLinks, parseArticleToJSON, parseJSONStringHashes } from '@/lib/utils/helpers';
import { channels } from '@/lib/utils/config';

const Reload: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);

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
                            onClick={() => generateArticle(channel.id)}
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