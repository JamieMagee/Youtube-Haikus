import logging
from os import environ

import httplib2
from googleapiclient.errors import HttpError
from oauth2client.client import GoogleCredentials

from reddityoutubehaikus import RedditYoutubeHaikus
from youtubehelper import YoutubeHelper


creds = GoogleCredentials(
    environ['YOUTUBE_ACCESS_TOKEN'],
    environ['YOUTUBE_CLIENT_ID'],
    environ['YOUTUBE_CLIENT_SECRET'],
    environ['YOUTUBE_REFRESH_TOKEN'],
    None,
    "https://www.googleapis.com/oauth2/v4/token",
    'Youtube Haikus'
)

http = creds.authorize(httplib2.Http())
creds.refresh(http)
youtube_helper = YoutubeHelper(creds)

time_periods = [
    {'interval': 'day', 'title': 'Top of the day'},
    {'interval': 'week', 'title': 'Top of the week'},
    {'interval': 'month', 'title': 'Top of the month'},
    {'interval': 'year', 'title': 'Top of the year'},
    {'interval': 'all', 'title': 'Top ever'}
]
logging.basicConfig(filename='haikus.log', filemode='w', level=logging.INFO)
logger = logging.getLogger(__name__)

playlists = youtube_helper.playlists()

for time_period in time_periods:
    r = RedditYoutubeHaikus(time_period['interval'])

    try:
        logger.info(
            'Trying to get playlist id for %s playlist.', time_period['interval'])
        playlist_id = [id for id in playlists['items']
                       if id['snippet']['title'] == time_period['title']][0]['id']

        logger.info('Playlist exists. Deleting items.')
        playlist_items = youtube_helper.playlist_items(playlist_id)

        while len(playlist_items) != 0:
            for playlist_item in playlist_items:
                youtube_helper.delete_playlist_item(playlist_item)
            playlist_items = youtube_helper.playlist_items(playlist_id)

    except IndexError:
        logger.warning('Playlist does not exist. Creating new playlist.')
        playlist_id = youtube_helper.create_playlist(time_period['title'])
    except HttpError as e:
        logger.error(e)

    for video_id, title in r.get_top():
        try:
            logger.info('Adding video with id %s to playlist %s',
                        video_id, time_period['title'])
            youtube_helper.add_item_to_playlist(
                playlist_id, video_id, title)

        except HttpError as e:
            logger.warning('Unable to add video to playlist')
            logger.error(e)
