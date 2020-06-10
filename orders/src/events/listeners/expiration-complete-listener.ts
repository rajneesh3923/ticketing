import {Subjects, Listener, ExpirationComplete, OrderStatus} from '@mytickets/common';
import {queueGroupName} from './queue-group-name';
import { Message } from 'node-nats-streaming'
import {Order} from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationComplete> {

  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName

  async onMessage(data: ExpirationComplete['data'], msg: Message) {

      const order = await Order.findById(data.orderId).populate('ticket');

      if(!order) {
        throw new Error('Order not found');
      }

      if(order.status === OrderStatus.Complete){
        return msg.ack();
      }

      order.set({
        status: OrderStatus.Cancelled
      })

      await order.save();

      new OrderCancelledPublisher(natsWrapper.client).publish({
          id: order.id,
          ticket: {
            id: order.ticket.id
          },
          version: order.version
      })

      msg.ack();

  }



}