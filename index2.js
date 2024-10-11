
async function main() {
    const express = require('express');
    const multer = require('multer');
    const axios = require('axios').default;
    const dotenv = require('dotenv');
    const fs = require('fs');
    const path = require('path');
    const ACRCloud = require('acrcloud');
    const { exec } = require('child_process');
  
    dotenv.config();
  
    const app = express();
    const port = process.env.PORT || 5000;
  
    const upload = multer({ dest: 'uploads/' });
  
    const ACRCloudHost = 'identify-eu-west-1.acrcloud.com';
    const ACRCloudAccessKey = '8a26f8b67305e49770b43aa017474291';
    const ACRCloudAccessSecret = 'GgrbE0i7IIcEBZxcYQfxngeakvLofwUDkDJ4B9Zy';
    const ExternalMetadataAPI = 'https://eu-api-v2.acrcloud.com/api/external-metadata';
    const SpotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const SpotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
    const acrcloudConfig = {
      host: ACRCloudHost,
      access_key: ACRCloudAccessKey,
      access_secret: ACRCloudAccessSecret,
    };
  
    const acr = new ACRCloud(acrcloudConfig);
  
    const clipAudio = (inputFilePath, duration, outputFilePath) => {
      return new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inputFilePath} -t ${duration} -acodec mp3 ${outputFilePath}`, (error) => {
          if (error) {
            reject(`Error clipping audio: ${error.message}`);
          } else {
            resolve(outputFilePath);
          }
        });
      });
    };
  
    const fetchSpotifyMetadata = async (artist, title) => {
      try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${SpotifyClientId}:${SpotifyClientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
  
        const accessToken = tokenResponse.data.access_token;
  
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            q: `artist:${artist} track:${title}`,
            type: 'track',
            limit: 1
          }
        });
  
        if (searchResponse.data.tracks.items.length > 0) {
          const track = searchResponse.data.tracks.items[0];
          return {
            song_url: track.external_urls.spotify,
            album_art_url: track.album.images[0].url,
            preview_url: track.preview_url,
            lyrics: 'No lyrics available from Spotify.' // Placeholder, you can use a separate API for lyrics
          };
        }
      } catch (error) {
        console.error('Error fetching metadata from Spotify:', error.message);
      }
      return {};
    };
  
    const fetchAppleMusicMetadata = async (artist, title) => {
      try {
        const searchResponse = await axios.get('https://itunes.apple.com/search', {
          params: {
            term: `${artist} ${title}`,
            entity: 'song',
            limit: 1
          }
        });
  
        if (searchResponse.data.results.length > 0) {
          const track = searchResponse.data.results[0];
          return {
            song_url: track.trackViewUrl,
            album_art_url: track.artworkUrl100,
            preview_url: track.previewUrl,
            lyrics: 'No lyrics available from Apple Music.' // Placeholder for Apple Music lyrics
          };
        }
      } catch (error) {
        console.error('Error fetching metadata from Apple Music:', error.message);
      }
      return {};
    };
  
    const fetchLyrics = async (artist, title) => {
      try {
        const response = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
        return response.data.lyrics;
      } catch (error) {
        console.error('Error fetching lyrics:', error.message);
        return 'Lyrics not available';
      }
    };
  
    const getExternalMetadata = async (acrId, artist, title) => {
      let externalMetadata = await fetchSpotifyMetadata(artist, title);
      let { song_url, album_art_url, preview_url, lyrics } = externalMetadata;
  
      if (!song_url || !album_art_url) {
        const appleMusicMetadata = await fetchAppleMusicMetadata(artist, title);
        song_url = song_url || appleMusicMetadata.song_url;
        album_art_url = album_art_url || appleMusicMetadata.album_art_url;
        preview_url = preview_url || appleMusicMetadata.preview_url;
      }
  
      if (!lyrics) {
        lyrics = await fetchLyrics(artist, title);
      }
  
      return { song_url, album_art_url, preview_url, lyrics };
    };
  
    app.post('/upload', upload.single('song'), async (req, res) => {
      try {
        const songFile = req.file;
        if (!songFile) {
          return res.status(400).send('No file was uploaded.');
        }
  
        const filePath = songFile.path;
        const clipDuration = 30;
        const clippedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}_clip.mp3`);
  
        await clipAudio(filePath, clipDuration, clippedFilePath);
  
        const fileBuffer = fs.readFileSync(clippedFilePath);
        const acrResponse = await acr.identify(fileBuffer);
  
        if (acrResponse.status.code !== 0) {
          console.log('ACRCloud response:', acrResponse);
          return res.status(500).json({ error: acrResponse.status.msg });
        }
  
        const songData = acrResponse.metadata.music[0];
        if (!songData) {
          throw new Error('No song data returned from ACRCloud.');
        }
  
        const externalMetadata = await getExternalMetadata(songData.acr_id, songData.artists[0].name, songData.title);
  
        const songInfo = {
          title: songData.title,
          artist: songData.artists[0].name,
          album: songData.album ? songData.album.name : 'Unknown',
          release_date: songData.release_date || 'Unknown',
          genre: songData.genres ? songData.genres.map(genre => genre.name).join(', ') : 'Unknown',
          album_art_url: externalMetadata.album_art_url || '',
          song_url: externalMetadata.song_url || '',
          preview_url: externalMetadata.preview_url || '',
          lyrics: externalMetadata.lyrics || 'Lyrics not available'
        };
  
        fs.unlinkSync(filePath);
        fs.unlinkSync(clippedFilePath);
  
        res.status(200).json(songInfo);
      } catch (error) {
        console.error('Error uploading song:', error.message);
        res.status(500).send('Error uploading song');
      }
    });
  
    app.post('/match', upload.single('song'), async (req, res) => {
      try {
        const songFile = req.file;
        if (!songFile) {
          return res.status(400).send('No file was uploaded.');
        }
  
        const filePath = songFile.path;
        const clipDuration = 25;
        const clippedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}_clip.mp3`);
  
        await clipAudio(filePath, clipDuration, clippedFilePath);
  
        const fileBuffer = fs.readFileSync(clippedFilePath);
        const acrResponse = await acr.identify(fileBuffer);
  
        if (acrResponse.status.code !== 0) {
          console.log('ACRCloud response:', acrResponse);
          return res.status(500).json({ error: acrResponse.status.msg });
        }
  
        const songData = acrResponse.metadata.music[0];
        if (!songData) {
          throw new Error('No song data returned from ACRCloud.');
        }
  
        const externalMetadata = await getExternalMetadata(songData.acr_id, songData.artists[0].name, songData.title);
  
        const songInfo = {
          title: songData.title,
          artist: songData.artists[0].name,
          album: songData.album ? songData.album.name : 'Unknown',
          release_date: songData.release_date || 'Unknown',
          genre: songData.genres ? songData.genres.map(genre => genre.name).join(', ') : 'Unknown',
          album_art_url: externalMetadata.album_art_url || '',
          song_url: externalMetadata.song_url || '',
          preview_url: externalMetadata.preview_url || '',
          lyrics: externalMetadata.lyrics || 'Lyrics not available'
        };
  
        fs.unlinkSync(filePath);
        fs.unlinkSync(clippedFilePath);
  
        res.status(200).json(songInfo);
      } catch (error) {
        console.error('Error matching song:', error.message);
        res.status(500).json({ error: 'Error matching song' });
      }
    });
  
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  
    function generateId() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let id = '';
      for (let i = 0; i < 22; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return id;
    }
  }
  
  main();
  