using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Apis.YouTube.v3;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace YoutubeHaikus
{
    public class YoutubeHaikus
    {
        private static readonly Dictionary<string, string> PlaylistTitleInterval = new Dictionary<string, string>
        {
            {"week", "Top of the week"},
            {"month", "Top of the month"},
            {"year", "Top of the year"},
            {"all", "Top ever"}
        };

        private readonly YoutubeHelper _youtubeHelper;
        private readonly RedditHelper _redditHelper;
        private readonly ILogger<YoutubeHaikus> _logger;

        public YoutubeHaikus(YoutubeHelper youtubeHelper, RedditHelper redditHelper, ILogger<YoutubeHaikus> logger)
        {
            _youtubeHelper = youtubeHelper;
            _redditHelper = redditHelper;
            _logger = logger;
        }
        
        [FunctionName("YoutubeHaikus")]
        public async Task Run([TimerTrigger("0 0 0 * * *")] TimerInfo myTimer)
        {
            foreach (var playlistTitleTuple in PlaylistTitleInterval)
            {
                var playlist = await _youtubeHelper.RecreatePlaylistAsync(playlistTitleTuple.Value);
                var posts = _redditHelper.GetTop(playlistTitleTuple.Key);
                await _youtubeHelper.AddPlaylistItemsAsync(playlist.Id, posts);
            }
        }
    }
}
