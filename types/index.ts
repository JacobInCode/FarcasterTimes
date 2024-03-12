export interface Article {
    id?: number;
    headline: string;
    body: string;
    sources?: any[];
    readTime?: number;
    image?: string;
    created_at?: Date;    
}

type Cast = {
    text: string;
    author_unique_username: string;
    author_display_name: string;
    author_id: string;
    cast_id: string;
    image_url: string;
};
