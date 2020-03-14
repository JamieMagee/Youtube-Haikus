using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Reddit;
using Reddit.Controllers;

namespace YoutubeHaikus
{
    public class RedditHelper
    {
        private readonly RedditClient _redditClient;
        
        private readonly ILogger _logger;

        public RedditHelper(ILogger logger)
        {
            _logger = logger;
            _redditClient = new RedditClient(
                appId: Environment.GetEnvironmentVariable("REDDIT_CLIENT_ID"),
                appSecret: Environment.GetEnvironmentVariable("REDDIT_CLIENT_SECRET"),
                refreshToken: Environment.GetEnvironmentVariable("REDDIT_REFRESH_TOKEN"),
                userAgent: "YoutubeHaikus"
                );
        }

        public List<LinkPost> GetTop(string interval)
        {
            var submissions = _redditClient.Subreddit("youtubehaiku").Posts.GetTop(interval, limit: 50);
            return submissions.Where(
                    submission => submission.Listing.URL != null && 
                    YoutubeHelper.YoutubeRegex.IsMatch(submission.Listing.URL)
                )
                .Cast<LinkPost>()
                .ToList();
        }
        
    }

}