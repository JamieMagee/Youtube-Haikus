using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Requests;
using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using Microsoft.Extensions.Logging;
using Reddit.Controllers;

namespace YoutubeHaikus
{
    public class YoutubeHelper
    {
        private readonly Lazy<Task<YouTubeService>> _youtubeService;
        private readonly ILogger<YoutubeHelper> _logger;
        public static readonly Regex YoutubeRegex = new Regex("(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^\"&?\\/ ]{11})");

        public YoutubeHelper(ILogger<YoutubeHelper> logger)
        {
            _logger = logger;
            _youtubeService = new Lazy<Task<YouTubeService>>(async () =>
            {
                var authorizationCodeFlow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = Environment.GetEnvironmentVariable("YOUTUBE_CLIENT_ID"),
                        ClientSecret = Environment.GetEnvironmentVariable("YOUTUBE_CLIENT_SECRET")
                    }
                });

                var tokenResponse = await authorizationCodeFlow.RefreshTokenAsync(
                    "e4zlSqIm2GOUzWayzUgr8g",
                    Environment.GetEnvironmentVariable("YOUTUBE_REFRESH_TOKEN"),
                    CancellationToken.None
                );

                var userCredential = new UserCredential(authorizationCodeFlow, "e4zlSqIm2GOUzWayzUgr8g", tokenResponse);
                return new YouTubeService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = userCredential
                });
            });
        }
        
        public async Task<Playlist> RecreatePlaylistAsync(string playlistTitle)
        {
            var service = await _youtubeService.Value;

            var playlistListRequest = service.Playlists.List("snippet");
            playlistListRequest.Mine = true;
            var playlistResponse = await playlistListRequest.ExecuteAsync();

            var playlist = playlistResponse.Items.FirstOrDefault(p => p.Snippet.Title == playlistTitle);
            if (playlist != null)
            {
                await service.Playlists.Delete(playlist.Id).ExecuteAsync();
            }

            return await service.Playlists.Insert(new Playlist
            {
                Snippet = new PlaylistSnippet
                {
                    Title = playlistTitle
                },
                Status = new PlaylistStatus
                {
                    PrivacyStatus = "public"
                }
            }, "snippet,status").ExecuteAsync();
        }

        public async Task AddPlaylistItemsAsync(string playlistId, List<LinkPost> posts)
        {
            var service = await _youtubeService.Value;

            var videoIds = string.Join(',', posts.Select(p => YoutubeRegex.Match(p.Listing.URL).Groups[1].Value));
            var videoRequest = service.Videos.List("id");
            videoRequest.Id = videoIds;
            var videoResponse = await videoRequest.ExecuteAsync();
            
            foreach (var post in videoResponse.Items)
            {
                var newPlaylistItem = new PlaylistItem
                {
                    Snippet = new PlaylistItemSnippet
                    {
                        PlaylistId = playlistId,
                        ResourceId = new ResourceId
                        {
                            Kind = "youtube#video",
                            VideoId = post.Id
                        }
                    }
                };
                
                await service.PlaylistItems.Insert(newPlaylistItem, "snippet")
                    .ExecuteAsync();
            }
        }
    }
}