import 'dotenv/config';
import dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config({ path: __dirname + `/../../.env.${process.env.ENV_FILE}` }); // change according to your need

export const envs = {
  PORT: get('PORT').required().asPortNumber(),
  DB_URL: get('POSTGRES_URL').required(),
  DB_PASSWORD: get('POSTGRES_PASSWORD').required(),
  DB_USER: get('POSTGRES_USER').required(),
  DB_NAME: get('POSTGRES_DB').required(),
  POSTGRES_URL: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
};
