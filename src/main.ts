import { Reddit } from './reddit';
import { intervals } from './types';
import { Youtube } from './youtube';

declare const global: {
  [x: string]: any;
};

global.haikus = (): void => {
  intervals.forEach((interval) => {
    const videos = new Reddit().getTop(interval);
    new Youtube(interval).doHaikus(videos);
  });
};
