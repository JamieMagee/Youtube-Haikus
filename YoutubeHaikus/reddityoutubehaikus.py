import logging
import re
from os import environ

import praw


class RedditYoutubeHaikus:
    youtube_regex = re.compile(
        r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})')

    logger = logging.getLogger(__name__)

    def __init__(self, interval, limit=50):
        self.interval = interval
        self.amount = limit

    def get_top(self):
        subreddit = praw.Reddit(client_id=environ['REDDIT_CLIENT_ID'],
                                client_secret=environ['REDDIT_CLIENT_SECRET'],
                                username=environ['REDDIT_USERNAME'],
                                password=environ['REDDIT_PASSWORD'],
                                user_agent='Youtube Haikus').subreddit('youtubehaiku')

        submissons = subreddit.top(self.interval, limit=self.amount)
        for submission in submissons:
            try:
                yield self.youtube_regex.search(submission.url).group(1), submission.title
            except AttributeError:
                try:
                    yield self.youtube_regex.search(submission.secure_media['oembed']['url']).group(1), submission.title
                except:
                    self.logger.warning(
                        f"{submission.url} doesn't appear to be a YouTube link")
