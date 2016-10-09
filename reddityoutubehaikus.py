import re

import praw


class RedditYoutubeHaikus:
    prog = re.compile('(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})')

    def __init__(self, interval, amount):
        self.interval = interval
        self.amount = amount

    def get_top(self):
        subreddit = praw.Reddit('Youtube Haikus').get_subreddit('youtubehaiku')
        method = getattr(subreddit, 'get_top_from_' + self.interval)

        submissons = method(limit=self.amount)
        for submission in submissons:
            yield self.prog.search(submission.url).group(1)
