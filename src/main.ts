import { Reddit } from './reddit';
import { intervals } from './types';
import { Youtube } from './youtube';

declare const global: {
  haikus: () => void;
};

global.haikus = (): void => {
  for (const interval of intervals) {
    Logger.log(`Processing interval: ${interval}`);
    const videos = new Reddit().getTop(interval);
    Logger.log(`Found ${videos.length} videos for ${interval}`);
    new Youtube(interval).doHaikus(videos);
    Logger.log(`Finished interval: ${interval}`);
  }
};
