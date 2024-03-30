import { Article } from "@/types";
import { channels } from "./config";

export function formatArticleWithAuthorLinks(article: string): string {
    const authorRegex = /\(AUTHOR: ([^\)]+)\)/g;

    return article.replace(authorRegex, (match, username) => {
        return `[${match.replace('(AUTHOR: ', '').replace(')', '')}](https://warpcast.com/${username})`;
    });
}

export function parseArticleToJSON(articleText: string): Article {
    // Split the text by "Article:" to separate the headline and article.
    const [headlinePart, articlePart] = articleText.split("\n\nARTICLE:\n\n");
    // Remove the "Headline:" prefix and trim any leading/trailing whitespace.
    const headline = headlinePart.replace("HEADLINE:\n\n", "").trim();
    console.log("HEADLINE", headline)
    // Trim the article part to remove any leading/trailing whitespace.
    console.log("ARTICLE", articlePart)
    const body = articlePart.trim();
    return { headline, body };
}
export const parseJSONStringHashes = (hashes: string): any[] => {

    if (hashes.includes('```json')) {
        hashes = hashes.replace(/\`\`\`json\n|\`\`\`/g, '').trim()
        if (!!hashes.match(/\[(.|\s)*?\]/)?.[0]) {
            hashes = hashes.match(/\[(.|\s)*?\]/)?.[0]!;
        }
    }

    return JSON.parse(hashes);
}

export function sliceAtNextSpace(str: string, limit: number) {
    if (str.length <= limit) return str;

    // Find the position to slice, starting from the limit
    let slicePosition = str.substring(0, limit).lastIndexOf(' ');

    // If there's no space before the limit, try finding the next space after the limit
    if (slicePosition === -1 || slicePosition < limit) {
        let nextSpacePosition = str.indexOf(' ', limit);
        slicePosition = nextSpacePosition !== -1 ? nextSpacePosition : limit;
    }

    return str.substring(0, slicePosition);
}

export function estimateReadingTime(text: string): number {
    const averageWordsPerMinute = 225;
    const averageEnglishWordLength = 5;

    // Calculate total words by dividing the text length by average word length
    const totalWords = text.length / averageEnglishWordLength;

    // Calculate reading time in minutes
    const readingTimeMinutes = totalWords / averageWordsPerMinute;

    // Round up to ensure reading time is at least 1 minute for short texts
    return Math.ceil(readingTimeMinutes);
}

export function removeMarkdownLinks(inputText: string): string {
    // Regex to match markdown links. It looks for patterns like [text](URL)
    const markdownLinkPattern = /\[([^\]]+)\]\([^\)]+\)/g;
    
    // Replace markdown links with just the text part
    return inputText.replace(markdownLinkPattern, '$1');
}

export function generateEmailHTML(articles: any[]) {
    // Assuming each article in the array has { headline, body, id }
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    let articlesHTML = articles.map(article =>
        `<h3><a href="https://citizentimes.xyz/article/${article.id}" style="text-decoration: underline; color: black;">${article.headline}</a></h3>
      <p style="text-decoration: none; color: gray;">${article.body}...</p><a href="https://citizentimes.xyz/article/${article.id}">Read more</a>`
    ).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Citizen Times Newsletter</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: black;">Citizen Times</h2>
            <p style="text-align: center; color: #666;">${currentDate}</p>
            ${articlesHTML}
        </div>
        </body>
        </html>
    `;
};

export function generateCitizenHTML(article: Article) {

    let articlesHTML =  `<h3><a href="https://citizentimes.xyz/article/${article.id}" style="text-decoration: underline; color: black;">${article.headline}</a></h3>
      <p style="text-decoration: none; color: gray;">${article.body.slice(0,75)}...</p><a href="https://citizentimes.xyz/article/${article.id}">Read more</a>`

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Citizen Article Generated!</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: black;">Successfully Generated your Article!</h2>
            ${articlesHTML}
        </div>
        </body>
        </html>
    `;
};

export const channelLabel = (channelId: string) => {
    return channels.find(channel => channel.id === channelId)?.label || '';
};