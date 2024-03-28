import { Article } from "@/types";
import { CastsResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { CastResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { createBrowserClient } from "@supabase/ssr";
import { defaultUrl, symbols } from "./config";
import { formatArticleWithAuthorLinks, parseArticleToJSON, parseJSONStringHashes } from "./helpers";

export async function generateSpeech(input: string): Promise<any> {
    try {
        const response = await fetch(`${defaultUrl}/api/audio`, { // Replace `${defaultUrl}/api/your-endpoint' with the actual endpoint path
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
        const response = await fetch(`${defaultUrl}/api/image`, { // Replace `${defaultUrl}/api/your-endpoint' with the actual endpoint path
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

export async function submitArticles(articles: Article[]) {
    try {
        const response = await fetch(`${defaultUrl}/api/articles`, {
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
        const response = await fetch(`${defaultUrl}/api/generate`, { // Use the correct endpoint
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

export async function lookUpCastByHashOrWarpcastUrl(urls: string[]): Promise<any> {
    try {

        console.log("urls", urls)
        const response = await fetch(`${defaultUrl}/api/lookUpCastByHashOrWarpcastUrl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({ urls }),
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

        const response = await fetch(`${defaultUrl}/api/fetchBulkCasts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({ hashes }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data as CastsResponse[];
    } catch (error) {
        console.error('Error looking up cast:', error);
        throw error;
    }
}

export async function fetchFeed(channelId: string): Promise<any> {
    try {

        const response = await fetch(`${defaultUrl}/api/fetchFeed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers, such as authorization tokens
            },
            body: JSON.stringify({ channelId }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw error;
    }
}

export async function fetchArticle(id: string): Promise<any> {
    try {
        const response = await fetch(`${defaultUrl}/api/article`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching article:', error);
        throw error;
    }
}

export async function initialFetch(channel_id: string) {

    const fetchPrice = async (symbol: string) => {
        try {
            const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
                method: 'GET',
                // @ts-ignore
                headers: {
                    'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch price');
            }

            const res = await response.json();
            return res.data[symbol].quote.USD.price;
        } catch (error) {
            console.error('Error fetching price:', error);
            throw error;
        }
    };

    const fetchPrices = async (symbols: string[]) => {
        const pricePromises = symbols.map(fetchPrice);
        const prices = await Promise.all(pricePromises);
        return prices.map(price => price.toLocaleString(undefined, { maximumFractionDigits: 2 }));
    };

    const prices = await fetchPrices(symbols);

    const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '');
    let articles = null;

    let query = supabaseAdmin
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(37); 

    if (channel_id !== 'all') {
        query = query.eq('channel_id', channel_id);
    }

    try {
        const { data: latestArticles, error: articlesError } = await query

        if (articlesError) {
            console.error(articlesError);
        }

        articles = latestArticles;
    } catch (error) {
        console.error(error);
    }

    return { prices, articles };
}

// CHAT GPT CALLS 

export async function writeArticle(casts: string) {

    const requestBody = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "system",
                "content": "You are a veteran journalist who has worked at the New York Times for years. Your writing is marked by a stark originality and concision, consistently eschewing the predictable and the overwrought in favor of the straightforward and genuine.\n\nYou are writing an article and a corresponding headline in the style of the New York Times about a series of related Farcaster casts. \n\n Your headlines are always original and uniquely describe the articles they represent. Your response should be formatted like this : \n Headline : headline goes here \n\n Article : Article goes here \n\n If you mention an author, instead of just writing their name, write (AUTHOR: author_unique_username goes here)"
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
        const response = await fetch(`${defaultUrl}/api/generate`, { // Use the correct endpoint
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

export async function organizeHashesByTopic(casts: string) {
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
        const response = await fetch(`${defaultUrl}/api/generate`, { // Use the correct endpoint
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
};

export async function chooseChannelId(channelIds: string, article: string) {

    const requestBody = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "user",
                "content": "From the following list of channel ids choose one id that most appropriately describes the following article. Only return the one word channel id exactly how it appears in the array of channel ids. \n\n Array of channel ids: " + channelIds + "\n\n Article: " + article
            }
        ],
        "temperature": 0.4,
        "max_tokens": 4095,
        "top_p": 0.18,
        "frequency_penalty": 0,
        "presence_penalty": 0.31
    };

    try {
        const response = await fetch(`${defaultUrl}/api/generate`, { // Use the correct endpoint
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

        return content;
    } catch (error) {
        console.error('Error calling the API:', error);
        throw error;
    }
};

export const generateArticle = async (channelId: string) => {
    try {

        console.log("GENERATING ARTICLE FOR CHANNEL", channelId)

        // GET RELEVANT CASTS
        const feedRes: any[] = await fetchFeed(channelId);

        console.log("FEED RES", feedRes)

        const fetchedRelevantCasts = feedRes.filter((cast) => {
                const castTimestamp = new Date(cast.timestamp);
                const now = new Date();
                now.setDate(now.getDate() - 1);
                return castTimestamp > now;
            }).map((cast) => {
                return {
                    ...cast,
                    likes: cast.reactions.likes.length,
                };
            });

        const castsWithOverTenLikes = fetchedRelevantCasts.filter((cast) => cast.likes > 10);

        const imageDescriptions = await Promise.all(castsWithOverTenLikes.map((cast: any) => {

            if (cast?.embeds[0]?.url && (cast.embeds[0]?.url.includes("png") || cast.embeds[0].url.includes("jpg") || cast.embeds[0].url.includes("jpeg") || cast.embeds[0].url.includes("gif"))) {
                return describeImage(cast.embeds[0].url)
            } else if (cast?.embeds[1]?.url && (cast.embeds[1].url.includes("png") || cast.embeds[1].url.includes("jpg") || cast.embeds[1].url.includes("jpeg") || cast.embeds[1].url.includes("gif"))) {
                return describeImage(cast.embeds[1].url)
            } else if (cast?.frames?.[0]?.image) {
                return describeImage(cast.frames[0].image)
            } else {
                return Promise.resolve(null)
            }

        }));

        const castsWithImageDescs = castsWithOverTenLikes.map((cast: any, index: number) => {
            return { ...cast, text: `CAST TEXT: ${cast.text} ${!!imageDescriptions[index] ? "\n DESCRIPTION OF IMAGE INCLUDED IN CAST: " + imageDescriptions[index] : ""}` }
        })

        console.log("NOW ORGANIZING CASTS BY TOPIC ")
        // Organize cast hashes by topic
        let topicallySortedCastHashes = await organizeHashesByTopic(JSON.stringify(castsWithImageDescs));

        let parsedHashes = parseJSONStringHashes(topicallySortedCastHashes);

        const casts = parsedHashes.map((hashes: string[]) => castsWithImageDescs.filter((cast) => hashes.includes(cast.hash)));

        // WRITE ARTICLES
        const writtenArticles = await Promise.all(casts.map((casts: any[]) => writeArticle(JSON.stringify(castsWithImageDescs))));

        // FORMATTING
        const addedLinks = writtenArticles.filter(a => !!a).map((article: any) => formatArticleWithAuthorLinks(article));

        const finalArticles = addedLinks.map((article: string) => parseArticleToJSON(article)).map((article: any, index: number) => {
            return {
                ...article,
                sources: casts[index].map((cast: any) => { return { hash: cast.cast_id, username: cast.author_unique_username, fid: cast.author_id } }),
                channel_id: channelId,
            };
        });

        // GENERATE IMAGES
        const finalArticlesWithImages = await Promise.all(finalArticles.map(async (article: any) => {
            const image = await generateImage(`Create an image to represent this newspaper headline : ${article.headline}`);
            return {
                ...article,
                image: image.imageUrl,
            };
        }))

        // SAVING
        await submitArticles(finalArticlesWithImages)

    } catch (error) {
        console.error('Error generating articles:', error);
    } 
};