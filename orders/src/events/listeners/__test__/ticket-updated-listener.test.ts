import { TicketUpdatedListener } from '../ticekt-updated-listener'
import { TicketUpdatedEvent } from '@mytickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket'
import mongoose from 'mongoose';

const setup = async () => {

  //create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })

  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version:ticket.version + 1,
    id: ticket.id,
    title: 'Movie concert',
    price: 124,
    userId: new mongoose.Types.ObjectId().toHexString()
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

it('finds, updates and saves a ticket', async () => {
    const {msg ,data ,ticket, listener} = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);


})

it('acks the message', async () => {
    const {msg ,data ,ticket, listener} = await setup();

   await listener.onMessage(data,msg);

   expect(msg.ack).toHaveBeenCalled()

})

it('does not call ack if the event has a skipped version number ', async () => {
    const {msg ,data ,ticket, listener} = await setup();

    data.version = 10;

    try {
     await listener.onMessage(data,msg);
    }catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();






})