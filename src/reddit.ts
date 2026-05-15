import { Properties } from './properties';
import type { Interval } from './types';

export class Reddit {
  readonly token: string;
  readonly youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
  readonly limit;
  readonly userAgent = 'script:YoutubeHaikus:v1.0 (by /u/JamieMagee)';

  constructor(limit = 50) {
    this.limit = limit;
    const props = new Properties();

    const options = {
      method: 'post' as const,
      payload: {
        grant_type: 'client_credentials',
      },
      headers: {
        authorization: `Basic ${Utilities.base64Encode(
          `${props.redditClientId}:${props.redditClientSecret}`
        )}`,
        'user-agent': this.userAgent,
      },
    };
    const res = UrlFetchApp.fetch(
      'https://www.reddit.com/api/v1/access_token',
      options
    );
    this.token = JSON.parse(res.getContentText())['access_token'];
  }

  public getTop(interval: Interval): string[] {
    const options = {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${this.token}`,
        'user-agent': this.userAgent,
      },
    };
    const res = UrlFetchApp.fetch(
      `https://oauth.reddit.com/r/youtubehaiku/top?t=${interval}&limit=${this.limit}`,
      options
    );
    const resJson: Listing = JSON.parse(res.getContentText());
    Logger.log(
      `Reddit returned ${resJson.data.children.length} posts for t=${interval}`
    );
    const urls = resJson.data.children
      .filter(
        (l) => l.data.url !== undefined && this.youtubeRegex.test(l.data.url)
      )
      .map((l) => this.youtubeRegex.exec(l.data.url)[1]);
    Logger.log(`Extracted ${urls.length} YouTube video IDs`);
    return urls;
  }
}

interface Listing {
  data: {
    children: {
      data: { url: string };
    }[];
  };
}
