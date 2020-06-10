import express, {Request ,Response, NextFunction} from 'express';
import { body }  from 'express-validator';
import {validateRequest, NotFoundError,requireAuth, NotAuthorizedError, BadRequest} from '@mytickets/common';
import {Ticket} from '../models/ticket'
import {TicketUpdatedPublisher} from '../events/publishers/ticket-updated-publisher';
import {natsWrapper}  from '../nats-wrapper';
import { version } from 'mongoose';


const router  = express.Router();

router.put('/api/tickets/:id', requireAuth, [

  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),

    body('price')
    .isFloat({gt:0})
    .withMessage('Price must be provided and must be greater than 0')

], validateRequest, async (req: Request, res: Response, next: NextFunction) => {

  const ticket = await Ticket.findById(req.params.id);

  if(!ticket) {
    return next(new NotFoundError());
  }

  if(ticket.orderId) {
    return next(new BadRequest('Ticket is already reserved'));
  }

  if (ticket.userId !== req.currentUser?.id) {
    return next(new NotAuthorizedError());
  }



  ticket.set({
    title: req.body.title,
    price: req.body.price
  })

  await ticket.save()
  await new TicketUpdatedPublisher(natsWrapper.client).publish({
     id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
   })

  res.send(ticket)

})


export { router as updateTicketRouter }

