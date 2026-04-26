import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const requiredMailConfig = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'MAIL_FROM',
];

const hasMailConfig = requiredMailConfig.every((key) => Boolean(process.env[key]));

const transporter = hasMailConfig
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    : null;

const sanitize = (value) => value.toString().replace(/\r/g, ' ').trim();

app.post('/api/contact', async (req, res) => {
    const name = sanitize(req.body?.name || '');
    const email = sanitize(req.body?.email || '');
    const context = sanitize(req.body?.context || 'General enquiry');
    const query = sanitize(req.body?.query || '');
    const subject = sanitize(req.body?.subject || 'RX Watt enquiry');

    if (!name || !email || !query) {
        return res.status(400).json({ ok: false, message: 'Name, email, and query are required.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ ok: false, message: 'Please provide a valid email address.' });
    }

    if (!transporter) {
        return res.status(500).json({
            ok: false,
            message: 'Mail delivery is not configured on the server yet.',
        });
    }

    const toAddress = process.env.CONTACT_TO || 'mahmoud@rxwatt.com';

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toAddress,
            replyTo: email,
            subject,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Request: ${context}`,
                '',
                'Query:',
                query,
            ].join('\n'),
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Request:</strong> ${context}</p>
                <p><strong>Query:</strong></p>
                <p>${query.replace(/\n/g, '<br>')}</p>
            `,
        });

        return res.json({ ok: true, message: 'Your request has been sent.' });
    } catch (error) {
        console.error('Contact form submission failed:', error);
        return res.status(500).json({
            ok: false,
            message: 'We could not send your request right now. Please try again shortly.',
        });
    }
});

app.get('*', (req, res) => {
    const requestedPath = path.join(__dirname, req.path);
    res.sendFile(requestedPath, (error) => {
        if (error) {
            res.status(404).sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

app.listen(port, () => {
    console.log(`RX Watt site running on http://localhost:${port}`);
});
