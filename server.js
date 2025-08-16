const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

// Get video info
app.get('/video-info', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });
  
  try {
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    res.json({ audioFormats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download audio
app.get('/download', (req, res) => {
  const url = req.query.url;
  const itag = req.query.itag;

  if (!url || !itag) return res.status(400).send('Missing URL or itag');

  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  ytdl(url, { filter: format => format.itag == itag })
    .pipe(res);
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
