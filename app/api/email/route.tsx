import nodemailer from 'nodemailer';
import * as z from "zod"

const schema = z.object({
    recipients: z.array(z.string()),
    subject: z.string(),
    text: z.string(),
    html: z.string(),
});

export async function POST(
    req: Request,
) {

    const json = await req.json();

    const { recipients, subject, text, html } = schema.parse(json);

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
        const results = await Promise.all(recipients.map(recipient => sendEmail(recipient)));
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        return new Response(null, { status: 500 })
    }
}
