import { TicketCreatedListener } from '../ticket-creater-listener'
import { TicketCreatedEvent } from '@mytickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import {Ticket} from '../../../models/ticket'
import mongoose from 'mongoose';

const setup = async () => {

  //create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version:0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // create fake msg object
  // @ts-ignore
  const msg: Message = {
      ack: jest.fn()
  }

  return {
    listener, data, msg
  }

}

it('creates and saves a ticket', async () => {

  const { listener, data, msg} = await setup();

  // call the onMessage func with the data and msg obj
  await listener.onMessage(data,msg);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id)

  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);


})


it('acks the message', async () => {

  const { data, listener, msg} = await setup()

  // call the onMessage func with the data and msg obj

  await listener.onMessage(data, msg);

  // write assertions to make sure a ack function is callled

  expect(msg.ack).toHaveBeenCalled()


})