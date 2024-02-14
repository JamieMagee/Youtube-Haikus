import { Reddit } from './reddit';
import { intervals } from './types';
import { Youtube } from './youtube';

declare const global: {
  haikus: () => void;
};

global['haikus'] = (): void => {
  for (const interval of intervals) {
    const videos = new Reddit().getTop(interval);
    new Youtube(interval).doHaikus(videos);
  }
};
