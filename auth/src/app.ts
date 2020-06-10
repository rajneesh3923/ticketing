import express from "express";
import {
  json
} from "body-parser";
import { errorHandler, NotFoundError } from '@mytickets/common';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';


const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false,
}))
app.use(currentUserRouter)
app.use(signInRouter)
app.use(signupRouter)
app.use(signOutRouter)
app.all('*', () => {
  throw new NotFoundError()
})
app.use(errorHandler)


export {app}