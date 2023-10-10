import 'express';

declare namespace Express {
  interface Request {
    context: {
      user?: {
        id: string;
      };
    };
  }
}
