import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { ExpirationComplete, OrderStatus } from '@mytickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import {Ticket} from '../../../models/ticket'
import {Order} from '../../../models/order'
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';


const setup = async () => {

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })

  ticket.save();

  const order = await Order.build({
    ticket,
    status: OrderStatus.Created,
    userId: 'dsadas',
    expiredAt: new Date(),
  })


  await order.save();

  const data: ExpirationComplete['data'] = {
    orderId: order.id
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, ticket, data, msg };

}


// it('updates the order status to cancelled ', async () => {
//   const {listener, order, ticket, data, msg} = await setup();

//   await listener.onMessage(data, msg);

//   const updatedOrder = await Order.findById(order.id);

//   expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);

// })

it('emit order cancelled event', async () => {
 const {listener, order, ticket, data, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);
})

it('ack the message', async () => {
 const {listener, order, ticket, data, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

})