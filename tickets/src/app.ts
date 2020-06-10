import express from "express";
import {
  json
} from "body-parser";
import { errorHandler, NotFoundError, currentUser } from '@mytickets/common';
import cookieSession from 'cookie-session';
import {createTicketRouter} from './routes/new';
import {showTicketRouter} from './routes/show';
import {indexTicketRouter} from './routes/index';
import {updateTicketRouter} from './routes/update';




const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false,
}))

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', () => {
  throw new NotFoundError()
})
app.use(errorHandler)


export {app}