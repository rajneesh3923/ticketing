import express, {Request, Response, NextFunction} from 'express';
import {requireAuth, validateRequest, NotFoundError} from '@mytickets/common';
import {Ticket}from '../models/ticket';



const router  = express.Router();


router.get('/api/tickets', async (req:Request, res: Response) => {

  const tickets = await Ticket.find({
    orderId: undefined
  });

  res.send(tickets);


}) 

export { router as indexTicketRouter }
