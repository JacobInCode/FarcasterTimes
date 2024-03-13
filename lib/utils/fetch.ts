import { Article } from "@/types";
import { CastsResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { CastResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";

export async function generateSpeech(input: string): Promise<any> {
    try {
        const response = await fetch('/api/audio', { // Replace '/api/your-endpoint' with the actual endpoint path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({ input }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        return data;
    } catch (error) {
        console.error('Error generating audio:', error);
        throw error;
    }
}

export async function generateImage(prompt: string): Promise<any> {
    try {
        const response = await fetch('/api/image', { // Replace '/api/your-endpoint' with the actual endpoint path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        return data;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

export async function submitArticle(articles: Article[]) {
    try {
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as necessary, e.g., for CSRF protection or authentication
            },
            body: JSON.stringify(articles),
        });

        if (!response.ok) {
            // Handle server errors or validation errors
            const errorData = await response.json();
            console.error('Server responded with an error:', errorData);
            return { error: true, data: errorData };
        }

        // Successfully added the article
        const newArticle = await response.json();
        console.log('Article submitted successfully:', newArticle);
        return { error: false, data: JSON.parse(newArticle) };
    } catch (error) {
        // Handle network errors
        console.error('Failed to submit article:', error);
        return { error: true, data: error };
    }
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

export function formatArticleWithAuthorLinks(article: string): string {
    const authorRegex = /\(AUTHOR: ([^\)]+)\)/g;

    return article.replace(authorRegex, (match, username) => {
        return `[${match.replace('(AUTHOR: ', '').replace(')', '')}](https://warpcast.com/${username})`;
    });
}

export async function describeImage(image_url: string) {
    
    const requestBody = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                role: "user",
                content: [
                  { type: "text", text: "What’s in this image?" },
                  {
                    type: "image_url",
                    image_url
                  },
                ],
              },
        ],
        "temperature": 0.4,
        "max_tokens": 4095,
        "top_p": 0.18,
        "frequency_penalty": 0,
        "presence_penalty": 0.31
    };

    try {
        const response = await fetch('/api/generate', { // Use the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any additional headers as needed, such as authorization headers
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.body as ReadableStream<Uint8Array>;
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
            try {
                const { value, done } = await reader.read();
                if (done) break;

                content += decoder.decode(value, { stream: true })

            } catch (readError) {
                console.error('Error reading data stream:', readError);
            }
        }

        // const data = await response.json();
        console.log("IMAGE desc ", content); // Process the response data as needed
        // If your response is a stream, handle accordingly
        return content;
    } catch (error) {
        console.error('Error calling the API:', error);
        throw error;
    }
}

export async function writeArticle(casts: string) {

    const requestBody = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "system",
                "content": "You are a veteran journalist who has worked at the New York Times for years. Your writing is marked by a stark originality and concision, consistently eschewing the predictable and the overwrought in favor of the straightforward and genuine.\n\nYou are writing an article in the style of the New York Times about a series of related Farcaster casts. \n\nYour response should be formatted like this :\nHeadline : headline goes here\nArticle : Article goes here\n\n If you mention an author, instead of just writing their name, write (AUTHOR: author_unique_username goes here)"
            },
            {
                "role": "user",
                "content": "Write an article in the style of the new york times about the following Farcaster casts. \n \nThese are the casts: " + casts
            }
        ],
        "temperature": 0.4,
        "max_tokens": 4095,
        "top_p": 0.18,
        "frequency_penalty": 0,
        "presence_penalty": 0.31
    };

    try {
        const response = await fetch('/api/generate', { // Use the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any additional headers as needed, such as authorization headers
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.body as ReadableStream<Uint8Array>;
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
            try {
                const { value, done } = await reader.read();
                if (done) break;

                content += decoder.decode(value, { stream: true })

            } catch (readError) {
                console.error('Error reading data stream:', readError);
                throw readError;
            }
        }

        // const data = await response.json();
        console.log(content); // Process the response data as needed
        // If your response is a stream, handle accordingly
        return content;
    } catch (error) {
        console.error('Error calling the API:', error);
        throw error;
    }
}

export async function callChatAPI(casts: string) {
    const requestBody = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "system",
                "content": "You are a serverside function that returns JSON. Always return an array of arrays of cast hashes. Each subarray should be organized by casts with text that is similar to each other. Example output: [[0x12345..., 0x78910...]]. Do not include \n characters in your output."
            },
            {
                "role": "user",
                "content": `These are the casts: ${casts}. Return an array of arrays of cast hashes. Each array should contain casts with text that is similar to each other.`
            },
            {
                "role": "assistant",
                "content": ""
            }
        ],
        "temperature": 0.15,
        "max_tokens": 4095,
        "top_p": 0.1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    };

    try {
        const response = await fetch('/api/generate', { // Use the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any additional headers as needed, such as authorization headers
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.body as ReadableStream<Uint8Array>;
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
            try {
                const { value, done } = await reader.read();
                if (done) break;

                content += decoder.decode(value, { stream: true })

            } catch (readError) {
                console.error('Error reading data stream:', readError);
            }
        }


        // const data = await response.json();
        console.log(content); // Process the response data as needed
        // If your response is a stream, handle accordingly
        return content

        // return data;
    } catch (error) {
        console.error('Error calling the API:', error);
        throw error;
    }
}

export async function lookUpCastByHashOrWarpcastUrl(urls: string[]): Promise<any> {
    try {

        console.log("urls", urls)
        const response = await fetch('/api/lookUpCastByHashOrWarpcastUrl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({urls}),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        return data as CastResponse[];
    } catch (error) {
        console.error('Error looking up cast:', error);
        throw error;
    }
};

export async function fetchBulkCasts(hashes: string[][]): Promise<any> {
    try {

        console.log("hashes", hashes)
        const response = await fetch('/api/fetchBulkCasts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({hashes}),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        return data as CastsResponse[];
    } catch (error) {
        console.error('Error looking up cast:', error);
        throw error;
    }
}

export async function fetchFeed(channelId: string): Promise<any> {
    try {
        const response = await fetch('/api/fetchFeed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({channelId}),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data); // Process the response data as needed
        return data;
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw error;
    }
}

// export const fetchAI = async () => {

//     try {

//         const response = await fetch(`/api/ai`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = response.body as ReadableStream<Uint8Array>;
//         const reader = data.getReader();
//         const decoder = new TextDecoder();
//         let content = '';

//         while (true) {
//             try {
//                 const { value, done } = await reader.read();
//                 if (done) break;

//                 content += decoder.decode(value, { stream: true })

//             } catch (readError) {
//                 console.error('Error reading data stream:', readError);
//             }
//         }

//         return content
//     } catch (error) {
//         console.error('Error during data streaming:', error);
//         return null;
//     }
// };