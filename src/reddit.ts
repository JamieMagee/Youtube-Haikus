import type { Interval } from './types';

export class Reddit {
  readonly youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
  readonly limit;

  constructor(limit = 50) {
    this.limit = limit;
  }

  public getTop(interval: Interval): string[] {
    const options = {
      headers: {
        accept: 'application/json',
        'user-agent': 'YoutubeHaikus',
      },
    };
    const res = UrlFetchApp.fetch(
      `https://www.reddit.com/r/youtubehaiku/top.json?t=${interval}&limit=${this.limit}`,
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

interface Listing {
  data: {
    children: {
      data: { url: string };
    }[];
  };
}
