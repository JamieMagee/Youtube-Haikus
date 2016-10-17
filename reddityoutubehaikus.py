import logging
import re

import praw


class RedditYoutubeHaikus:
    youtube_regex = re.compile('(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})')

    logger = logging.getLogger(__name__)

    def __init__(self, interval, amount):
        self.interval = interval
        self.amount = amount

    def get_top(self):
        subreddit = praw.Reddit('Youtube Haikus').get_subreddit('youtubehaiku')
        method = getattr(subreddit, 'get_top_from_' + self.interval)

        submissons = method(limit=self.amount)
        for submission in submissons:
            try:
                yield self.youtube_regex.search(submission.url).group(1), submission.title
            except AttributeError as e:
                try:
                    yield self.youtube_regex.search(submission.secure_media['oembed']['url']).group(1), submission.title
                except:
                    self.logger.warning("{} doesn't appear to be a YouTube link".format(submission.url))
