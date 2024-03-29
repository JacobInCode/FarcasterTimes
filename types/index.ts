export interface Article {
    id?: number;
    headline: string;
    body: string;
    sources?: any[];
    readTime?: number;
    image?: string;
    created_at?: Date;   
    audio?: string; 
    channel_id?: string;
    citizen?: boolean;
}
