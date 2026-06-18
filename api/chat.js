export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server API key not configured' });
        }

        const systemInstruction = `You are Mitti, an expert Natural Farming Consultant. Answer only questions related to natural farming, organic remedies, companion planting, weather, market rates, and government subsidies (like PKVY, PM-Kisan). Strictly refuse to answer off-topic queries (e.g. general knowledge, programming, non-farming topics, recipes of other foods) by saying: "I can only help you with natural farming, organic remedies, companion planting, weather, market rates, and government subsidies. Please ask an agriculture-related question!". Keep your responses concise, action-oriented, and structured. Do not use markdown bold/italic formatting in a way that sounds weird when spoken.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: query }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `Gemini API error: ${errText}` });
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            const reply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply });
        } else {
            return res.status(500).json({ error: 'Invalid response from Gemini API' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
