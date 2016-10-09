import logging
import os
import sys

import httplib2
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client.tools import argparser, run_flow

from reddityoutubehaikus import RedditYoutubeHaikus

CLIENT_SECRETS_FILE = "client_secrets.json"

MISSING_CLIENT_SECRETS_MESSAGE = """
WARNING: Please configure OAuth 2.0

To make this sample run you will need to populate the client_secrets.json file
found at:

   %s

with information from the Developers Console
https://console.developers.google.com/

For more information about the client_secrets.json file format, please visit:
https://developers.google.com/api-client-library/python/guide/aaa_client_secrets
""" % os.path.abspath(os.path.join(os.path.dirname(__file__),
                                   CLIENT_SECRETS_FILE))

# This OAuth 2.0 access scope allows for full read/write access to the
# authenticated user's account.
YOUTUBE_READ_WRITE_SCOPE = "https://www.googleapis.com/auth/youtube"
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

flow = flow_from_clientsecrets(CLIENT_SECRETS_FILE,
                               message=MISSING_CLIENT_SECRETS_MESSAGE,
                               scope=YOUTUBE_READ_WRITE_SCOPE)

storage = Storage("%s-oauth2.json" % sys.argv[0])
credentials = storage.get()

if credentials is None or credentials.invalid:
    flags = argparser.parse_args()
    credentials = run_flow(flow, storage, flags)

youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
                http=credentials.authorize(httplib2.Http()))

time_periods = ['day', 'week', 'month', 'year', 'all']
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

playlists = youtube.playlists().list(
    part='snippet',
    mine=True
).execute()

for time_period in time_periods:
    r = RedditYoutubeHaikus(time_period, 50)

    try:
        logger.info('Trying to get playlist id for %s playlist.', time_period)
        playlist_id = [id for id in playlists['items'] if id['snippet']['title'] == time_period][0]['id']
        logger.info('Playlist exists. Deleting items.')
        playlist_items = youtube.playlistItems().list(
            part='id',
            maxResults=50,
            playlistId=playlist_id
        ).execute()['items']
        for playlist_item in playlist_items:
            youtube.playlistItems().delete(
                id=playlist_item['id']
            ).execute()
    except IndexError:
        logger.warn('Playlist does not exist. Creating new playlist.')
        playlist_id = youtube.playlists().insert(
            part="snippet,status",
            body=dict(
                snippet=dict(
                    title=time_period,
                ),
                status=dict(
                    privacyStatus="private"
                )
            )
        ).execute()['id']

    for video_id in r.get_top():
        try:
            logger.info('Adding video with id %s to playlist %s', video_id, time_period)
            youtube.playlistItems().insert(
                part='snippet',
                body=dict(
                    snippet=dict(
                        playlistId=playlist_id,
                        resourceId=dict(
                            kind='youtube#video',
                            videoId=video_id
                        )
                    )
                )
            ).execute()
        except HttpError as e:
            logger.warn('Unable to add video to playlist')
            print(e)
