//index.js
async function main() {
    const express = require('express');
    const multer = require('multer');
    const axios = require('axios').default;
    const dotenv = require('dotenv');
    // const { createClient } = require('@supabase/supabase-js');
    const fs = require('fs');
    const path = require('path');
    const ACRCloud = require('acrcloud');
    const { exec } = require('child_process');
  
    dotenv.config();
  
    const app = express();
    const port = process.env.PORT || 5000;
  
    // const supabaseUrl = process.env.SUPABASE_URL;
    // const supabaseKey = process.env.SUPABASE_ANON_KEY;
    // const supabase = createClient(supabaseUrl, supabaseKey);
  
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
  
    if (!acrcloudConfig.host || !acrcloudConfig.access_key || !acrcloudConfig.access_secret) {
      console.error('Missing ACRCloud configuration values');
      process.exit(1);
    }
  
    const acr = new ACRCloud(acrcloudConfig);
  
    const clipAudio = (inputFilePath, duration, outputFilePath) => {
      return new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inputFilePath} -t ${duration} -acodec mp3 ${outputFilePath}`, (error, stdout, stderr) => {
          if (error) {
            reject(`Error clipping audio: ${error.message}`);
          } else {
            resolve(outputFilePath);
          }
        });
      });
    };
  
    const fetchExternalMetadata = async (acrId) => {
      try {
        const response = await axios.get(ExternalMetadataAPI, {
          params: {
            access_key: ACRCloudAccessKey,
            access_secret: ACRCloudAccessSecret,
            id: acrId
          }
        });
  
        if (response.data) {
          return response.data;
        } else {
          return {};
        }
      } catch (error) {
        console.error('Error fetching external metadata from ACRCloud:', error.message);
        return {};
      }
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
            album_art_url: track.album.images[0].url
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
            album_art_url: track.artworkUrl100
          };
        }
      } catch (error) {
        console.error('Error fetching metadata from Apple Music:', error.message);
      }
      return {};
    };
  
    const getExternalMetadata = async (acrId, artist, title) => {
      let externalMetadata = await fetchExternalMetadata(acrId);
      let { song_url, album_art_url } = externalMetadata;
  
      if (!song_url || !album_art_url) {
        const spotifyMetadata = await fetchSpotifyMetadata(artist, title);
        song_url = song_url || spotifyMetadata.song_url;
        album_art_url = album_art_url || spotifyMetadata.album_art_url;
  
        if (!song_url || !album_art_url) {
          const appleMusicMetadata = await fetchAppleMusicMetadata(artist, title);
          song_url = song_url || appleMusicMetadata.song_url;
          album_art_url = album_art_url || appleMusicMetadata.album_art_url;
        }
      }
  
      return { song_url, album_art_url };
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
          id: songData.external_ids ? songData.external_ids.isrc || generateId() : generateId(),
          title: songData.title,
          artist: songData.artists[0].name,
          album: songData.album ? songData.album.name : 'Unknown',
          release_date: songData.release_date || 'Unknown',
          duration: songData.duration_ms ? (songData.duration_ms / 1000) : 'Unknown',
          genre: songData.genres ? songData.genres.map(genre => genre.name).join(', ') : 'Unknown',
          album_art_url: externalMetadata.album_art_url || '',
          song_url: externalMetadata.song_url || '',
          fingerprint: songData.acr_id
        };
  
        const artistID = generateId();
        const albumID = generateId();
        const songID = songInfo.id || generateId();
  
        const { data: insertArtistData, error: insertArtistError } = await supabase
          .from('artists')
          .upsert({
            id: artistID,
            name: songInfo.artist,
            bio: ''
          })
          .select()
          .single();
  
        if (insertArtistError) {
          return res.status(500).json({ error: insertArtistError.message });
        }
  
        const { data: albumData, error: albumError } = await supabase
          .from('albums')
          .upsert({
            id: albumID,
            title: songInfo.album,
            artist_id: insertArtistData.id,
            release_date: songInfo.release_date,
            genre: songInfo.genre
          })
          .select()
          .single();
  
        if (albumError) {
          return res.status(500).json({ error: albumError.message });
        }
  
        const { data: songDataInsert, error: songError } = await supabase
          .from('songs')
          .upsert({
            id: songID,
            title: songInfo.title,
            artist: songInfo.artist,
            artist_id: insertArtistData.id,
            genre: songInfo.genre,
            release_date: songInfo.release_date,
            duration: songInfo.duration,
            song_url: songInfo.song_url,
            album_art_url: songInfo.album_art_url,
            album_id: albumData.id
          })
          .select()
          .single();
  
        if (songError) {
          throw songError;
        }
  
        const { data: fingerprintData, error: fingerprintError } = await supabase
          .from('fingerprints')
          .insert({
            song_id: songDataInsert.id,
            fingerprint_data: songInfo.fingerprint
          })
          .select()
          .single();
  
        if (fingerprintError) {
          return res.status(500).json({ error: fingerprintError.message });
        }
  
        fs.unlinkSync(filePath);
        fs.unlinkSync(clippedFilePath);
  
        res.status(200).send('Song uploaded and metadata stored successfully.');
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
          song_url: externalMetadata.song_url || ''
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
  
  
  
  
  
  
  
  
  