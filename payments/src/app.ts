import express from "express";
import {
  json
} from "body-parser";
import { errorHandler, NotFoundError, currentUser } from '@mytickets/common';
import cookieSession from 'cookie-session';
import {createChargeRouter} from './routes/new'

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false,
}))

app.use(currentUser);

app.use(createChargeRouter);

app.all('*', () => {
  throw new NotFoundError()
})
app.use(errorHandler)


export {app}