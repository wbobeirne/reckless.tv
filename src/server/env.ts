import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL as string,
  SESSION_SECRET: process.env.SESSION_SECRET || "REPLACE ME PLS",
};
