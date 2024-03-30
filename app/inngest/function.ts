import { describeImage, fetchFeed, generateImage, getTopFiveArticles, organizeHashesByTopic, submitArticles, writeArticle, genCitizenArticle } from "@/lib/utils/fetch";
import { inngest } from "./client";
import { formatArticleWithAuthorLinks, generateCitizenHTML, generateEmailHTML, parseArticleToJSON, parseJSONStringHashes } from "@/lib/utils/helpers";
import { defaultUrl } from "@/lib/utils/config";

export const generateChannelArticle = inngest.createFunction(
    { id: "generate-article" },
    { event: "generate.article" },
    async ({ event, step }) => {

        const channelId = event.data.channelId;
        const daysBack = event.data.daysBack || 1;

        // FETCH CHANNEL CASTS
        const channelCasts = await step.run("fetch-feed", async () => {
            const feedRes: any[] = await fetchFeed(channelId);

            const fetchedRelevantCasts = feedRes.filter((cast) => {
                const castTimestamp = new Date(cast.timestamp);
                const now = new Date();
                now.setDate(now.getDate() - daysBack);
                return castTimestamp > now;
            }).map((cast) => {
                return {
                    ...cast,
                    likes: cast.reactions.likes.length,
                };
            });

            const castsWithOverTenLikes = fetchedRelevantCasts.filter((cast) => cast.likes > 10);

            // console.log("CASTS WITH OVER TEN LIKES", castsWithOverTenLikes);
            return castsWithOverTenLikes;
        });

        // ADD IMAGE DESCRIPTIONS
        const castsWithImageDescs = await step.run("image-descriptions", async () => {

            const imageDescriptions = await Promise.all(channelCasts.map((cast: any) => {
                // stop describing images for testing
                return Promise.resolve(null)

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

            const castsWithImageDescs = channelCasts.map((cast: any, index: number) => {
                return { ...cast, text: `CAST TEXT: ${cast.text} ${!!imageDescriptions[index] ? "\n DESCRIPTION OF IMAGE INCLUDED IN CAST: " + imageDescriptions[index] : ""}` }
            })

            return castsWithImageDescs;
        });

        // ORGANIZE HASHES BY TOPIC 
        const topicallyOrganizedCasts = await step.run("organize-by-topics", async () => {

            let topicallySortedCastHashes = await organizeHashesByTopic(JSON.stringify(castsWithImageDescs));

            let parsedHashes = parseJSONStringHashes(topicallySortedCastHashes);

            const casts = parsedHashes.map((hashes: string[]) => castsWithImageDescs.filter((cast) => hashes.includes(cast.hash)));

            return casts;

        });

        // WRITE ARTICLES 
        const writtenArticles = await step.run("write-articles", async () => {

            const articles = await Promise.all(topicallyOrganizedCasts.map((casts: any[]) => writeArticle(JSON.stringify(casts))));

            // FORMATTING
            const addedLinks = articles.filter(a => !!a).map((article: any) => formatArticleWithAuthorLinks(article));

            const finalArticles = addedLinks.map((article: string) => parseArticleToJSON(article)).map((article: any, index: number) => {
                return {
                    ...article,
                    sources: topicallyOrganizedCasts[index].map((cast: any) => { 
                        const likes = cast?.reactions?.likes?.length || 0;
                        const recasts = cast?.reactions?.recasts?.length || 0;
                        const replies = cast?.reactions?.replies?.count || 0;
                        return { hash: cast.hash, username: cast.author.username, fid: cast.author.fid, likes, recasts, replies} 
                    }),
                    channel_id: channelId,
                    citizen: false
                };
            });

            return finalArticles;

        });

        // GENERATE IMAGES
        const articlesWithImages = await step.run("generate-images", async () => {

            const finalArticlesWithImages = await Promise.all(writtenArticles.map(async (article: any) => {
                const image = await generateImage(`Create an image to represent this newspaper headline : ${article.headline}`);
                return {
                    ...article,
                    image: image.imageUrl,
                };

            }))

            return finalArticlesWithImages;

        });

        // SAVING
        await step.run("saving-articles", async () => {
            await submitArticles(articlesWithImages);
        });

        // console.log("SAVING ARTICLES");

    },
);

export const sendEmails = inngest.createFunction(
    { id: "send-emails" },
    { event: "send.emails" },
    async ({ event, step }) => {

        // find top 5 articles from last 24 hrs 
        const topFive = await getTopFiveArticles();

        console.log(topFive);    

        const emailData = {
            subject: "Citizen Times - Top 5 Articles",
            text : "Here are the top 5 articles from Citizen Times over the last 24hrs.",
            html: generateEmailHTML(topFive.map((article: any) => ({ headline: article.headline, body: article.body.slice(0, 75), id: article.id }))),
        };

        // send emails to subscribers

        await step.run("send-emails", async () => {
            // send email
            try {
                const response = await fetch(`${defaultUrl}api/batchEmail`, { // Replace with your actual endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData),
                });
    
                const result = await response.json();
                console.log(result);
            } catch (error) {
                console.error('Error sending email:', error);
            }
        })
    },
);

export const generateCitizenArticle = inngest.createFunction(
    { id: "generate-citizen-article" },
    { event: "generate.citizen.article" },
    async ({ event, step }) => {

        console.log("GENERATING CITIZEN ARTICLE", event.data.urls);

        const data = await genCitizenArticle(event.data.urls);

        const emailData = {
            recipient: event.data.email,
            subject: "Citizen Article Completed!",
            text : "Your article has been generated successfully.",
            html: generateCitizenHTML(data[0]),
        };

        console.log("EMAIL DATA", emailData);

        // send emails to subscribers

        await step.run("send-email", async () => {
            // send email
            try {
                const response = await fetch(`${defaultUrl}api/email`, { // Replace with your actual endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData),
                });
    
                const result = await response.json();
                console.log(result);
            } catch (error) {
                console.error('Error sending email:', error);
            }
        })
    },
);