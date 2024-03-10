export interface Article {
    id?: number;
    headline: string;
    body: string;
    sources?: any[];
    readTime?: number;
    image?: string;
}