import express, {Request, Response, NextFunction} from 'express';
import {requireAuth, NotFoundError, NotAuthorizedError} from '@mytickets/common';
import { Order, OrderStatus } from '../models/order';
import {OrderCancelledPublisher} from '../events/publishers/order-cancelled-publisher';
import {natsWrapper} from '../nats-wrapper';
const router = express.Router();


router.delete('/api/orders/:orderId', requireAuth,  async (req: Request, res: Response, next: NextFunction) => {

    const  {orderId} = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if(!order) {
        return next(new NotFoundError());
    }

    if(order.userId !== req.currentUser?.id) {
            return  next(new NotAuthorizedError());
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })


    res.status(204).send(order);
})




export { router as deleteOrderRouter }