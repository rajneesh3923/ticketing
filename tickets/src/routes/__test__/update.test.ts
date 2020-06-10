import request from 'supertest';
import { app } from '../../app';
import mongoose, { mongo } from 'mongoose';
import {natsWrapper} from '../../nats-wrapper';
import {Ticket} from '../../models/ticket';

const id = mongoose.Types.ObjectId().toHexString();



it('returns a 404 if provided id does not exist', async () => {

    await request(app)
      .put(`/api/ticketes/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: "dasdds",
        price: 123
      })
      .expect(404)

})


it('returns a 401 if the user is not authenticated', async () => {
     await request(app)
      .put(`/api/ticketes/${id}`)
      .send({
        title: "dasdds",
        price: 123
      })
      .expect(404)

})


it('returns a 404 if the user does not own the ticket', async () => {
   const response =  await request(app)
          .post(`/api/tickets`)
          .set("Cookie", global.signin())
          .send({
            title: "dasdds",
            price: 123
          })


          await request(app)
                  .put(`/api/tickets/${response.body.id}`)
                  .set('Cookie', global.signin())
                  .send({
                    title: 'dasdasdasdsdasdsd',
                    price: 15
                  })
                  .expect(401)

        })


it('returns a 404 if the user provides invalid title or price', async () => {


  const cookie = global.signin()

  const response =  await request(app)
          .post(`/api/tickets`)
          .set("Cookie", cookie)
          .send({
            title: "dasdds",
            price: 123
          })

        await request(app).put(`/api/tickets/${response.body.id}`)
                          .set('Cookie', cookie)
                          .send({
                            title: '',
                            price: 20
                          })
                          .expect(400)


        await request(app).put(`/api/tickets/${response.body.id}`)
                          .set('Cookie', cookie)
                          .send({
                            title: 'sdadsa',
                            price: -20
                          })
                          .expect(400)




})


it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin()

  const response =  await request(app)
          .post(`/api/tickets`)
          .set("Cookie", cookie)
          .send({
            title: "dasdds",
            price: 123
          })

        await request(app).put(`/api/tickets/${response.body.id}`)
                          .set('Cookie', cookie)
                          .send({
                            title: 'first ticket',
                            price: 20
                          })
                          .expect(200);

        const ticketResponse =  await request(app).get(`/api/tickets/${response.body.id}`).send();

        expect(ticketResponse.body.title).toEqual('first ticket');
                            


})


it('Publishes an event', async () => {

   const cookie = global.signin()

  const response =  await request(app)
          .post(`/api/tickets`)
          .set("Cookie", cookie)
          .send({
            title: "dasdds",
            price: 123
          })

        await request(app).put(`/api/tickets/${response.body.id}`)
                          .set('Cookie', cookie)
                          .send({
                            title: 'first ticket',
                            price: 20
                          })
                          .expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();

})


it('rejects updates if ticket is reserved', async () => {

  const cookie = global.signin()

  const response =  await request(app)
          .post(`/api/tickets`)
          .set("Cookie", cookie)
          .send({
            title: "dasdds",
            price: 123
          })

  const ticket = await Ticket.findById(response.body.id);

  ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket?.save();


  await request(app).put(`/api/tickets/${response.body.id}`)
                    .set('Cookie', cookie)
                    .send({
                      title: 'first ticket',
                      price: 20
                    })
                    .expect(400);



})