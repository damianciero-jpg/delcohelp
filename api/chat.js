export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = { ...req.body };
    body.model = "claude-sonnet-4-6";
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message, type: data.error.type });
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}