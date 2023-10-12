export type Context = {
  user?: {
    id: string;
  };
  token?: string;
};

export type ConnectionParameters<T extends object = object> = {
  first?: number;
  after?: string;
} & T;
