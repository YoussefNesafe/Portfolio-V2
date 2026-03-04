export interface IAdminPostsTable {
  titleCol: string;
  statusCol: string;
  dateCol: string;
  actionsCol: string;
}

export interface IAdminPostsEmpty {
  message: string;
  cta: string;
}

export interface IAdminPostsStatus {
  published: string;
  draft: string;
}

export interface IAdminPostsPagination {
  previous: string;
  next: string;
  pageOf: string;
}

export interface IAdminPostsDictionary {
  title: string;
  newPost: string;
  table: IAdminPostsTable;
  empty: IAdminPostsEmpty;
  status: IAdminPostsStatus;
  fallback: { uncategorized: string };
  mobileLabels: { status: string; date: string };
  pagination: IAdminPostsPagination;
}

export interface IAdminDictionary {
  posts: IAdminPostsDictionary;
}
