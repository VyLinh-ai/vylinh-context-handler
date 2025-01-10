interface PagingResponseCursor<T> {
  data: T[];
  paging: {
    limit: number;
    lastCursor: string;
  };
}
