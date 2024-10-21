"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image'

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '1234';
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000';  // Replace with your redirect URI
const scopes = 'user-top-read';  // Scope for reading user's top tracks

// Root type for the response
export interface SpotifyTopTracksResponse {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
  previous: string | null;
  href: string;
  next: string | null;
}

// Track type, representing each track in the 'items' array
export interface Track {
  album: Album;
  artists: Artist[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
}

// Album type, representing the album information in each track
export interface Album {
  album_type: string;
  artists: Artist[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  total_tracks: number;
  type: string;
  uri: string;
}

// Artist type, representing each artist in the 'artists' array
export interface Artist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

// ExternalUrls type, representing Spotify links (for track, album, artist, etc.)
export interface ExternalUrls {
  spotify: string;
}

// ExternalIds type, representing the ISRC (or other identifiers) of a track
export interface ExternalIds {
  isrc: string;
}

// Image type, representing album artwork (or other images)
export interface Image {
  height: number;
  url: string;
  width: number;
}

function App() {
  const [accessToken, setAccessToken] = useState<string>();
  const [topTracks, setTopTracks] = useState<Track[]>([]);

  useEffect(() => {
    // Parse access token from URL hash
    const hash = window.location.hash;

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token') || undefined;
      setAccessToken(token);

      // Remove token from URL for clean navigation
      window.location.hash = '';
    }
  }, []);

  const loginWithSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };

  const fetchTopTracks = () => {
    if (!accessToken) return;

    fetch('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setTopTracks(data.items);
      })
      .catch(error => {
        console.error('Error fetching top tracks:', error);
      });
  };

  return (
    <div className="flex flex-col gap-10 items-center min-h-screen m-8">
      <h1 className="text-2xl font-bold">Spotify Top Tracks</h1>
      {!accessToken ? (
        <button onClick={loginWithSpotify} className='bg-green-500 hover:bg-green-600 transition px-3 py-2 font-semibold'>Log in with Spotify</button>
      ) : (
        <>
        {
          topTracks.length === 0 &&
          <button onClick={fetchTopTracks} className="bg-black text-white border-2 border-white px-3 py-2 hover:bg-white hover:text-black transition">Get My Top Tracks</button>
        }
          {topTracks.length > 0 && (
              <div className="flex flex-wrap w-full justify-center gap-2">
                {topTracks.map(track => (
                  <a href={track.external_urls.spotify} target='_blank' key={track.id} className="text-center flex  flex-col w-[300px] outline outline-2 outline-white">
                    <Image alt={`${track.name} album cover`} src={track.album.images[1].url} width={300} height={300} />
                    <div className='flex flex-col p-3 justify-around h-full'>
                      <span className='font-semibold text-wrap text-lg line-clamp-2 overflow-hidden'>{track.name}</span>
                      <span className='text-lg line-clamp-2 overflow-hidden'>{track.artists.map(artist => artist.name).join(', ')}</span> </div>
                  </a>
                ))}
              </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
