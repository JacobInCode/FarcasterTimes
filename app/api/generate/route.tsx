import * as z from "zod"
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { createBrowserClient } from "@supabase/ssr";
// export const maxDuration = 25; // This function can run for a maximum of 300 seconds
// export const dynamic = 'force-dynamic';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

const schema = z.object({
    model: z.string(),
    max_tokens: z.number(),
    messages: z.array(z.object({
        role: z.string(),
        content: z.any()
    })),
    temperature: z.number(),
    top_p: z.number(),
    frequency_penalty: z.number(),
    presence_penalty: z.number(),
});

export async function POST(req: Request) {
    try {
        const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

        if (!supabaseAdmin) {
            throw new Error('Not authenticated');
        }

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);

        const json = await req.json();
        const { model, max_tokens, messages, temperature, top_p, frequency_penalty, presence_penalty } = schema.parse(json);
        const chatMessages: ChatCompletionRequestMessage[] = messages.map((message: any) => ({
            role: message.role as ChatCompletionRequestMessageRoleEnum,
            content: message.content,
        }));

        const response = await openai.createChatCompletion({
            model,
            stream: true,
            max_tokens,
            messages: chatMessages,
            temperature,
            top_p,
            frequency_penalty,
            presence_penalty,
        });

        // Adjusted part: Setup for streaming with initial delay handling
        let hasStreamStarted = false;

        // Setup a timeout to send an initial message if the stream is delayed
        const initialTimeout = setTimeout(() => {
            if (!hasStreamStarted) {
                // Stream hasn't started, so send an initial message (e.g., empty string or placeholder)
                // Note: You may need to adjust how this is sent based on your StreamingTextResponse API
                // This is a placeholder response. You might need to use a specific method to send data in your streaming response.
                console.log("Stream delayed, sending initial data.");
            }
        }, 5000); // 5 seconds

        // Example of handling the OpenAI stream
        // You will need to integrate this logic with your actual stream handling
        const stream = OpenAIStream(response);

        stream.getReader().read().then(({ done, value }) => {
            if (done) {
                console.log("Stream ended.");
            } else {
                console.log("Stream started.");
                clearTimeout(initialTimeout); // Clear the initial timeout as the stream has started
                hasStreamStarted = true;
            }
        });

        // Assuming StreamingTextResponse is your way of returning a streaming response
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error("Error in AI chat route:", error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 });
        }
        return new Response(null, { status: 500 });
    }
}