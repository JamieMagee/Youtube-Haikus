import { Properties } from './properties';
import { Interval } from './types';

export class Reddit {
  readonly token: string;
  readonly youtubeRegex = new RegExp(
    '(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/ ]{11})'
  );
  readonly limit;

  constructor(limit: number = 50) {
    this.limit = limit;
    const props = new Properties();

    const options = {
      method: 'post' as HttpMethod,
      payload: {
        grant_type: 'password',
        username: props.redditUsername,
        password: props.redditPassword,
      },
      headers: {
        authorization: `Basic ${Buffer.from(
          `${props.redditClientId}:${props.redditClientSecret}`
        ).toString('base64')}`,
        'user-agent': 'YoutubeHaikus',
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
        'user-agent': 'YoutubeHaikus',
      },
    };
    const res = UrlFetchApp.fetch(
      `https://oauth.reddit.com/r/youtubehaiku/top?t=${interval}&limit=${this.limit}`,
      options
    );
    const resJson: Listing = JSON.parse(res.getContentText());
    const urls = resJson.data.children
      .filter(
        (l) => l.data.url !== undefined && this.youtubeRegex.test(l.data.url)
      )
      .map((l) => this.youtubeRegex.exec(l.data.url)[1]);
    return urls;
  }
}

type HttpMethod = 'get' | 'delete' | 'patch' | 'post' | 'put';
interface Listing {
  data: {
    children: {
      data: { url: string };
    }[];
  };
}
