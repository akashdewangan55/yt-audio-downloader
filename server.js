const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const port = 3000;

app.use(cors());

app.get('/video-info', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    try {
        const info = await ytdl.getInfo(videoURL);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        res.json({ audioFormats });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching video info' });
    }
});

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const itag = req.query.itag;

    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid YouTube URL');
    }
    if (!itag) {
        return res.status(400).send('No itag specified');
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });
        if (format) {
            res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
            ytdl(videoURL, { format: format }).pipe(res);
        } else {
            res.status(400).send('Invalid format selected');
        }
    } catch (error) {
        res.status(500).send('Error downloading audio');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:3000`);
});
