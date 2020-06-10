import express, {Request, Response, NextFunction} from 'express';
import {requireAuth, validateRequest, NotFoundError} from '@mytickets/common';
import {body} from 'express-validator'
import {Ticket}from '../models/ticket';



const router   = express.Router();



router.get('/api/tickets/:id', async (req: Request, res: Response, next: NextFunction) => {

  const ticket = await Ticket.findById(req.params.id);

  if(!ticket) {
    return  next(new NotFoundError());
  }

  res.send(ticket);


})

export  { router as showTicketRouter }