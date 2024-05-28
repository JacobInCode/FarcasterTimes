import nodemailer from 'nodemailer';
import * as z from "zod"

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";

const schema = z.object({
    recipient: z.string(),
    file_id: z.string(),
});

const getHtml = (file_id: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #333333;
    }
    .content {
      text-align: center;
    }
    .content p {
      font-size: 16px;
      color: #666666;
      line-height: 1.5;
    }
    .content a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
      text-decoration: none;
      border-radius: 5px;
    }
    .content a:hover {
      background-color: #0056b3;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Roneo Translation</h1>
    </div>
    <div class="content">
      <p>Your translation is ready!</p>
      <p>You can download it using the link below:</p>
      <a href=${file_id} target="_blank">Download PDF</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 Roneo. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

export async function POST(
    req: Request,
) {
    const json = await req.json();

    const { recipient, file_id } = schema.parse(json);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const subject = 'Roneo - Your translation is ready!';

    const sendEmail = (recipient: string) => {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: process.env.GMAIL_EMAIL,
                to: recipient,
                subject: subject,
                text: `Roneo - Your translation is ready! ${file_id}`,
                html: getHtml(file_id),
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
