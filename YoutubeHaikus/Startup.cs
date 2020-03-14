using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

[assembly: FunctionsStartup(typeof(YoutubeHaikus.Startup))]
namespace YoutubeHaikus
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<YoutubeHelper>();
            builder.Services.AddSingleton<RedditHelper>();
        }
    }
}