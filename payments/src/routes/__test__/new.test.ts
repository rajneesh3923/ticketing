import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose'
import {Order} from '../../models/order';
import {OrderStatus} from '@mytickets/common'
import {stripe} from '../../stripe';

jest.mock('../../stripe');

it('returns 404 when purchasing order that does not exist', async () => {

  await request(app)
          .post('/api/payments')
          .set('Cookie', global.signin())
          .send({
            token: 'dsad',
            orderId: mongoose.Types.ObjectId().toHexString()
          })
          .expect(404)

})

it('returns 401 when purchasing order that does not belong to user', async () => {

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId:  mongoose.Types.ObjectId().toHexString(),
    price: 45,
    status: OrderStatus.Created,
    version: 0
  })
  await order.save();
    
  await request(app)
          .post('/api/payments')
          .set('Cookie', global.signin())
          .send({
            token: 'dsad',
            orderId: order.id
          })
          .expect(401)

})


it('returns 404 when purchasing a cancelled order', async () => {

 const userId = mongoose.Types.ObjectId().toHexString()

 const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price: 45,
    status: OrderStatus.Cancelled,
    version: 0
  })
  await order.save();
    
  await request(app)
          .post('/api/payments')
          .set('Cookie', global.signin(userId))
          .send({
            token: 'dsad',
            orderId: order.id
          })
          .expect(400)
})


it('returns a 204 with valid inputs', async () => {

 const userId = mongoose.Types.ObjectId().toHexString()

 const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price: 45,
    status: OrderStatus.Created,
    version: 0
  })
  await order.save();

  await request(app)
          .post('/api/payments')
          .set('Cookie', global.signin(userId))
          .send({
            token: 'tok_visa',
            orderId: order.id
          })
          .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

  expect(chargeOptions.source).toEqual('tok_visa')
  expect(chargeOptions.amount).toEqual(45*100);
  expect(chargeOptions.currency).toEqual('usd');
  
   
    
})