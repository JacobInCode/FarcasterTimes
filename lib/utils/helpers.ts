export function formatArticleWithAuthorLinks(article: string): string {
    const authorRegex = /\(AUTHOR: ([^\)]+)\)/g;

    return article.replace(authorRegex, (match, username) => {
        return `[${match.replace('(AUTHOR: ', '').replace(')', '')}](https://warpcast.com/${username})`;
    });
}