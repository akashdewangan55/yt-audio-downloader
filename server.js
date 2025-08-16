const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
app.use(cors());

// Video info
app.get('/video-info', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    // Ensure proper YouTube URL
    const fixedUrl = url.startsWith('http') ? url : `https://www.youtube.com/watch?v=${url}`;
    const info = await ytdl.getInfo(fixedUrl);

    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly').map(f => ({
      itag: f.itag,
      mimeType: f.mimeType,
      bitrate: f.bitrate,
      audioQuality: f.audioQuality,
    }));

    res.json({ audioFormats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Download route
app.get('/download', (req, res) => {
  const { url, itag } = req.query;
  if (!url || !itag) return res.status(400).send('Missing URL or itag');

  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  ytdl(url, { filter: format => format.itag == itag })
    .pipe(res);
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
