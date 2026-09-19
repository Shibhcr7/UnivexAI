import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// PASTE YOUR GROQ API KEY HERE
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/generate', async (req, res) => {
    try {
        const { messages, mode } = req.body || {};
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).send('Messages array required');
        }

        let systemPrompt = "Univex user Test\n\nYou are Univex AI built by Shibhyavardhan.p. Always start your response with 'Univex user Test'.";
        if (mode === 'planes') systemPrompt = "Univex user Test\n\nYou are an expert aviation engineer created by Shibhyavardhan.p. Always start your response with 'Univex user Test'.";
        if (mode === 'rockets') systemPrompt = "Univex user Test\n\nYou are an aerospace engineer created by Shibhyavardhan.p. Always start your response with 'Univex user Test'.";

        // Updated model ID to active endpoint
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [{ role: "system", content: systemPrompt }, ...messages],
                temperature: 0.3,
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (!response.ok) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.write(`data: ${JSON.stringify({ error: data.error?.message || 'Groq API Error' })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
        }

        const reply = data.choices[0]?.message?.content || '';

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.write(`data: ${JSON.stringify({ token: reply })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (err) {
        console.error('Server Execution Error:', err.message);
        res.setHeader('Content-Type', 'text/event-stream');
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

app.listen(PORT, () => console.log(`🚀 Univex Gateway Active on Port ${PORT}`));