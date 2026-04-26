export default async function handler(req, res) {
  try {
    // Accept channel via query param, fall back to env default (SJC)
    const channelId = req.query.channel || process.env.YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Whitelist allowed channels to prevent abuse
    const allowedChannels = [
      "UCD2w33roAho2im82m6G6LKg", // SJC (St. John Chrysostom)
      "UCCp3aYYeUjcbewP_zqvkk7Q", // RPPC (Ridley Park Presbyterian)
    ];

    if (!allowedChannels.includes(channelId)) {
      return res.status(403).json({ error: 'Channel not allowed' });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=8&type=video`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'YouTube API error' });
  }
}
