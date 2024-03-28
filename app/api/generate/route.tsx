import * as z from "zod";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { createBrowserClient } from "@supabase/ssr";

export const runtime = 'edge';

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
        const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '');
        if (!supabaseAdmin) {
            throw new Error('Not authenticated');
        }

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const json = await req.json();
        const { model, max_tokens, messages, temperature, top_p, frequency_penalty, presence_penalty } = schema.parse(json);

        // Convert messages to the required format for OpenAI API
        const chatMessages: ChatCompletionRequestMessage[] = messages.map((message: any) => ({
            role: message.role as ChatCompletionRequestMessageRoleEnum,
            content: message.content,
        }));

        const responsePromise = openai.createChatCompletion({
            model,
            stream: true,
            max_tokens,
            messages: chatMessages,
            temperature,
            top_p,
            frequency_penalty,
            presence_penalty,
        });

        let streamStarted = false;

        const stream = new ReadableStream({
            start(controller) {
                const initialTimeout = setTimeout(() => {
                    if (!streamStarted) {
                        // Send an initial message if the stream hasn't started
                        controller.enqueue("Initial data due to delay.");
                    }
                }, 5000); // 5 seconds

                responsePromise.then(response => {
                    streamStarted = true;
                    clearTimeout(initialTimeout);

                    // Assuming OpenAIStream wraps the response in a way that we can read it as a stream
                    const reader = response?.body?.getReader();
                    const push = () => {
                        reader?.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        }).catch(error => {
                            console.error(error);
                            controller.error(error);
                        });
                    };
                    push();
                }).catch(error => {
                    console.error("Error setting up the OpenAI stream:", error);
                    controller.error(error);
                });
            }
        });

        return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
    } catch (error) {
        console.error("Error in AI chat route:", error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 });
        }
        return new Response(null, { status: 500 });
    }
}
