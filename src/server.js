import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(env('PORT', 3000));

export const setupServer = () => {
  const app = express();

  app.use(
    cors({
      origin: env('CORS_APPROVED_DOMAINS')?.join(',') ?? [],
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    pino({
      trasport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('/api-docs', swaggerDocs());

  app.use(router);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
