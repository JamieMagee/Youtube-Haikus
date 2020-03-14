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
        
        public async Task<Playlist> GetPlaylistAsync(string playlistTitle)
        {
            var service = await _youtubeService.Value;

            var playlistRequest = service.Playlists.List("snippet");
            playlistRequest.Mine = true;

            var playlistResponse = await playlistRequest.ExecuteAsync();

            return playlistResponse.Items.First(p => p.Snippet.Title == playlistTitle);
        }

        public async Task<bool> IsPlaylistEmptyAsync(string playlistId)
        {
            var playlistItems = GetPlaylistItemsAsync(playlistId);
            return await playlistItems.GetAsyncEnumerator().MoveNextAsync() == false;
        }

        private async IAsyncEnumerable<PlaylistItem> GetPlaylistItemsAsync(string playlistId)
        {
            var service = await _youtubeService.Value;
            var nextPageToken = "";

            while (nextPageToken != null)
            {
                var playlistItemsListRequest = service.PlaylistItems.List("id,snippet");
                playlistItemsListRequest.PlaylistId = playlistId;
                playlistItemsListRequest.MaxResults = 50;
                playlistItemsListRequest.PageToken = nextPageToken;

                var userPlaylistItemListResponse = await playlistItemsListRequest.ExecuteAsync();

                foreach (var playlistItem in userPlaylistItemListResponse.Items)
                {
                    yield return playlistItem;
                }

                nextPageToken = userPlaylistItemListResponse.NextPageToken;
            }
        }

        public async Task DeletePlaylistItemsAsync(string playlistId)
        {
            var service = await _youtubeService.Value;
            await foreach (var playlistItem in GetPlaylistItemsAsync(playlistId))
            {
                try
                {
                    await service.PlaylistItems.Delete(playlistItem.Id).ExecuteAsync();
                }
                catch (GoogleApiException e)
                {
                    _logger.LogWarning($"Could not delete {playlistItem.Snippet.Title} from playlist with ID {playlistId}", e);
                }
            }
        }

        public async Task AddPlaylistItemsAsync(string playlistId, List<LinkPost> posts)
        {
            var service = await _youtubeService.Value;
            foreach (var newPlaylistItem in posts.Select(post => new PlaylistItem
            {
                Snippet = new PlaylistItemSnippet
                {
                    PlaylistId = playlistId,
                    ResourceId = new ResourceId
                    {
                        Kind = "youtube#video",
                        VideoId = YoutubeRegex.Match(post.Listing.URL).Groups[1].Value
                    }
                },
                ContentDetails = new PlaylistItemContentDetails
                {
                    Note = post.Title
                }
            }))
            {
                await service.PlaylistItems.Insert(newPlaylistItem, "snippet,contentDetails")
                    .ExecuteAsync();
            }
        }
    }
}