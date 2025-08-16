const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
app.use(cors());

// Get video info
app.get('/video-info', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const info = await ytdl.getInfo(url);

    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly').map(f => ({
      itag: f.itag,
      mimeType: f.mimeType,
      bitrate: f.bitrate || 0,
      audioQuality: f.audioQuality || 'unknown'
    }));

    res.json({ audioFormats });
  } catch (err) {
    console.error('Error fetching video info:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Download audio
app.get('/download', (req, res) => {
  const { url, itag } = req.query;
  if (!url || !itag) return res.status(400).send('Missing URL or itag');

  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  ytdl(url, { filter: format => format.itag == itag }).pipe(res);
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
