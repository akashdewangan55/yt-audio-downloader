const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());

// Get audio formats
app.get('/video-info', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  exec(`yt-dlp -j ${url}`, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'yt-dlp error' });
    }

    try {
      const info = JSON.parse(stdout);
      const audioFormats = info.formats
        .filter(f => f.acodec !== 'none')
        .map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          abr: f.abr,
          acodec: f.acodec
        }));
      res.json({ audioFormats });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse yt-dlp output' });
    }
  });
});

// Download audio
app.get('/download', (req, res) => {
  const { url, itag } = req.query;
  if (!url || !itag) return res.status(400).send('Missing URL or format_id');

  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  const proc = exec(`yt-dlp -f ${itag} -o - ${url}`);
  proc.stdout.pipe(res);
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
