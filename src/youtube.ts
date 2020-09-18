import { Interval } from './types';

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
      playlist = this.createPlaylist();
    } else {
      playlist = this.recreatePlaylist(playlist.id);
    }

    videos.forEach((video) => {
      try {
        this.addVideoToPlaylist(playlist.id, video);
      } catch (e) {
        Logger.log(e);
      }
    });
  }

  private createPlaylist(): GoogleAppsScript.YouTube.Schema.Playlist {
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

  private recreatePlaylist(
    playlistId: string
  ): GoogleAppsScript.YouTube.Schema.Playlist {
    YouTube.Playlists.remove(playlistId);
    return this.createPlaylist();
  }

  private addVideoToPlaylist(playlistId: string, video: string): void {
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
