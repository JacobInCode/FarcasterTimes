// import { getServerSession } from "next-auth"
import * as z from "zod"
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { createBrowserClient } from "@supabase/ssr";
// export const maxDuration = 300; // This function can run for a maximum of 300 seconds

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

const schema = z.object({
        model: z.string(),
        max_tokens: z.number(),
        messages: z.array(z.object({
            role: z.string(),
            content: z.string()
        })),
        temperature: z.number(),
        top_p: z.number(),
        frequency_penalty: z.number(),
        presence_penalty: z.number()
});
    
export async function POST(
    req: Request,
) {
    try {
        const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

        if (!supabaseAdmin) {
            throw new Error('Not authenticated')
        }

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);
        // Validate route params.

        const json = await req.json();

        const { model, max_tokens, messages, temperature, top_p, frequency_penalty, presence_penalty } = schema.parse(json);

        console.log("model", model, "max_tokens", max_tokens, "messages", messages, "temperature", temperature, "top_p", top_p, "frequency_penalty", frequency_penalty, "presence_penalty", presence_penalty)
        
        const chatMessages: ChatCompletionRequestMessage[] = messages.map((message: any) => {
            return {
                role: message.role as ChatCompletionRequestMessageRoleEnum,
                content: message.content
            }
        })

        const response = await openai.createChatCompletion({
            model,
            stream: false,
            max_tokens,
            messages: chatMessages,
            temperature, 
            top_p, 
            frequency_penalty, 
            presence_penalty,
        })

        const res = await response.json()
        console.log("response", res)

        // return stream response (SSE)
        return new Response(JSON.stringify(res.choices[0].message.content), { status: 200 });

    } catch (error) {
        console.log("Error in ai chat route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}

