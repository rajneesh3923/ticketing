import { OrderCreatedListener } from '../order-created-listener'
import {natsWrapper} from '../../../nats-wrapper';
import { OrderCreatedEvent, OrderStatus } from '@mytickets/common';
import mongoose from 'mongoose';
import {Ticket} from '../../../models/ticket'
import {Message} from 'node-nats-streaming'


const setup = async () => {

  //create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //Create and save a ticket

  const ticket = Ticket.build({
    title: 'concert',
    price: 999,
    userId: 'dasda'
  })

  await ticket.save();


  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version:0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'dasdas',
    ticket: {
      id: ticket.id,
      price: ticket.price
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

// it('sets the userId of the ticket', async () => {
//     const {data,listener,msg,ticket} = await setup()

//     await listener.onMessage(data,msg);

//     const updatedTicket = await Ticket.findById(ticket.id);

//     expect(updatedTicket?.orderId).toEqual(data.id);



// })

// it('acks the msg', async () => {
//   const {data,listener,msg,ticket} = await setup()

//   await listener.onMessage(data,msg);

//   expect(msg.ack).toHaveBeenCalled()
// })

it('published a ticket updated event', async () => {

  const {data,listener,msg,ticket} = await setup()

  await listener.onMessage(data,msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  console.log((natsWrapper.client.publish as jest.Mock).mock.calls)

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);




})