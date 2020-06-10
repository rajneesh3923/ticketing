import request from 'supertest';
import { app } from '../../app';

import { Order } from '../../models/order'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose';


const buildTicket = async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })

    await ticket.save();

    return ticket;
}


it('fetches orders for an particular user ', async () => {

  // Create three tickets
  const ticketone   = await buildTicket()
  const tickettwo   = await buildTicket()
  const ticketthree = await buildTicket()

  const userOne = global.signin();
  const userTwo = global.signin();
  // Create one order as user #1

  await request(app)
          .post('/api/orders')
          .set('Cookie', userOne)
          .send({ ticketId: ticketone.id })
          .expect(201);

  // Create two order as user #2

   await request(app)
          .post('/api/orders')
          .set('Cookie', userTwo)
          .send({ ticketId: tickettwo.id })
          .expect(201);

   await request(app)
          .post('/api/orders')
          .set('Cookie', userTwo)
          .send({ ticketId: ticketthree.id })
          .expect(201);

  // Make request to get orders for user #2

  const response = await request(app)
                          .get("/api/orders")
                          .set('Cookie', userTwo)
                          .expect(200);

  // Make sure we only got the orders for user #2

  expect(response.body.length).toEqual(2);


})