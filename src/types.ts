export const intervals = ['week', 'month', 'year', 'all'] as const;
export type Interval = (typeof intervals)[number];
