import type { Interval } from './types';

export class Youtube {
  readonly playlistTitle: string;
  constructor(interval: Interval) {
    this.playlistTitle = `Top of ${interval}`;
  }

  doHaikus(videos: string[]): void {
    const playlists = YouTube.Playlists.list('id,snippet', {
      mine: true,
    });
    let playlist = playlists.items.find(
      (p) => p.snippet.title === this.playlistTitle
    );

    if (playlist === undefined) {
      Logger.log(`Creating new playlist: ${this.playlistTitle}`);
      playlist = this.#createPlaylist();
    } else {
      Logger.log(`Recreating playlist: ${this.playlistTitle}`);
      playlist = this.#recreatePlaylist(playlist.id);
    }

    let added = 0;
    for (const video of videos) {
      try {
        this.#addVideoToPlaylist(playlist.id, video);
        added++;
      } catch (e) {
        Logger.log(`Failed to add video ${video}: ${e}`);
      }
    }
    Logger.log(
      `Added ${added}/${videos.length} videos to ${this.playlistTitle}`
    );
  }

  #createPlaylist(): GoogleAppsScript.YouTube.Schema.Playlist {
    return YouTube.Playlists.insert(
      {
        snippet: {
          title: this.playlistTitle,
        },
        status: {
          privacyStatus: 'public',
        },
      },
      'snippet,status'
    );
  }

  #recreatePlaylist(
    playlistId: string
  ): GoogleAppsScript.YouTube.Schema.Playlist {
    YouTube.Playlists.remove(playlistId);
    return this.#createPlaylist();
  }

  #addVideoToPlaylist(playlistId: string, video: string): void {
    YouTube.PlaylistItems.insert(
      {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: video,
          },
        },
      },
      'snippet'
    );
  }
}
