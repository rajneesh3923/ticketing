import { OrderCancelledListener } from '../order-cancelled-listener'
import {natsWrapper} from '../../../nats-wrapper';
import { OrderCancelledEvent, OrderStatus } from '@mytickets/common';
import mongoose from 'mongoose';
import {Ticket} from '../../../models/ticket'
import {Message} from 'node-nats-streaming'


const setup = async () => {

  //create an instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  //Create and save a ticket

  const ticket = Ticket.build({
    title: 'concert',
    price: 999,
    userId: 'dasda'
  })

  ticket.set({orderId: new mongoose.Types.ObjectId().toHexString()})

  await ticket.save();

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version:0,
    ticket: {
      id: ticket.id,
    }
  }

  // create fake msg object
  // @ts-ignore
  const msg: Message = {
      ack: jest.fn()
  }

  return {
    listener, data, msg, ticket
  }

}

it('updates the ticket ,published an event, and acks the message', async () => {
    const {data,listener,msg,ticket} = await setup()

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.orderId).not.toBeDefined()

    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();

})