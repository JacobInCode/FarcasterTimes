import { Article } from "@/types";

export function formatArticleWithAuthorLinks(article: string): string {
    const authorRegex = /\(AUTHOR: ([^\)]+)\)/g;

    return article.replace(authorRegex, (match, username) => {
        return `[${match.replace('(AUTHOR: ', '').replace(')', '')}](https://warpcast.com/${username})`;
    });
}

export function parseArticleToJSON(articleText: string): Article {
    // Split the text by "Article:" to separate the headline and article.
    const [headlinePart, articlePart] = articleText.split("\n\nArticle:\n\n");

    // Remove the "Headline:" prefix and trim any leading/trailing whitespace.
    const headline = headlinePart.replace("Headline: ", "").trim();

    // Trim the article part to remove any leading/trailing whitespace.
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
