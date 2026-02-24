export interface IBragStatsDictionary {
  totalEntries: string;
  thisMonth: string;
  weekStreak: string;
  categories: string;
}

export interface IBragDictionary {
  title: string;
  subtitle: string;
  noEntries: string;
  stats: IBragStatsDictionary;
}
