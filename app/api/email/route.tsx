import { createBrowserClient } from '@supabase/ssr';
import nodemailer from 'nodemailer';
import * as z from "zod"

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";

const schema = z.object({
    recipient: z.string(),
    subject: z.string(),
    text: z.string(),
    html: z.string(),
});

export async function POST(
    req: Request,
) {
    const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

    if (!supabaseAdmin) {
        throw new Error('Not authenticated')
    }

    const json = await req.json();

    const { recipient, subject, text, html } = schema.parse(json);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const sendEmail = (recipient: string) => {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: process.env.GMAIL_EMAIL,
                to: recipient,
                subject: subject,
                text: text,
                html: html,
            };

            transporter.sendMail(mailOptions, (error: any, info: any) => {
                if (error) {
                    console.error('Error sending email:', error);
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    };

    try {
        const results = await sendEmail(recipient);
        console.log('Email sent:', results);
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        return new Response(null, { status: 500 })
    }
}
