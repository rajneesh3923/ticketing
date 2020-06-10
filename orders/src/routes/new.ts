import express, {Request, Response, NextFunction} from 'express';
import mongoose, { mongo } from 'mongoose';
import {requireAuth,BadRequest, validateRequest, NotFoundError, OrderStatus} from '@mytickets/common';
import {body} from 'express-validator';
import {Ticket} from '../models/ticket';
import {Order} from '../models/order'
import {OrderCreatedPublisher} from '../events/publishers/order-created-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;


router.post('/api/orders', requireAuth, [

  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided')

], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  
    const {ticketId} = req.body;
    
    // Find the ticket the user is try to order in the database

    const ticket = await Ticket.findById(ticketId);

      if(!ticket) {
       
          return next(new NotFoundError());
      }

    // Make sure this ticket is not already reserved

     const isReserved = await ticket.isReserved();

       if(isReserved) {
          return next(new BadRequest('Ticket is already reserved'));
      }

    // Calculate an expiration date for this order

      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build the order and save it to the database

      const order = Order.build({
        ticket: ticket,
        status: OrderStatus.Created,
        userId: req.currentUser!.id,
        expiredAt: expiration
      })

      await order.save();

      await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiredAt.toISOString(),
        ticket: {
          id: ticket.id,
          price: ticket.price
        }
      })

    // Publish an event saying that an order was created

      res.status(201).send(order);


})


export { router as newOrderRouter }