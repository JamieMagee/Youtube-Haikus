from googleapiclient.discovery import build


class YoutubeHelper:

    def __init__(self, credentials):
        self.youtube = build("youtube", "v3", credentials=credentials)

    def create_playlist(self, title):
        return self.youtube.playlists().insert(
            part="snippet,status",
            body=dict(
                snippet=dict(
                    title=title,
                ),
                status=dict(
                    privacyStatus="public"
                )
            )
        ).execute()['id']

    def playlists(self):
        return self.youtube.playlists().list(
            part='snippet',
            mine=True
        ).execute()

    def playlist_items(self, playlist_id):
        return self.youtube.playlistItems().list(
            part='id',
            maxResults=50,
            playlistId=playlist_id
        ).execute()['items']

    def delete_playlist_item(self, playlist_item):
        return self.youtube.playlistItems().delete(
            id=playlist_item['id']
        ).execute()

    def add_item_to_playlist(self, playlist_id, video_id, title):
        return self.youtube.playlistItems().insert(
            part='snippet,contentDetails',
            body=dict(
                snippet=dict(
                    playlistId=playlist_id,
                    resourceId=dict(
                        kind='youtube#video',
                        videoId=video_id
                    )
                ),
                contentDetails=dict(
                    note=title
                )
            )
        ).execute()
