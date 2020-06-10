import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successfull signUp', async () => {
  return request(app)
          .post('/api/users/signup')
          .send({
            email: "rajneesh@gmail.com",
            password: "password"
          })
          .expect(201);
});

it('returns a 400 with invalid email', async () => {
  return request(app)
          .post('/api/users/signup')
          .send({
            email: "rajneesh@gmailcom",
            password: "password"
          })
          .expect(400);
})

it('returns a 400 with invalid password', async () => {
  return request(app)
          .post('/api/users/signup')
          .send({
            email: "rajneesh@gmail.com",
            password: "pas"
          })
          .expect(400);
})


it('returns a 400 with missing email and password', async () => {
  return request(app)
          .post('/api/users/signup')
          .send({
            email: "rajneesh@gmail.com",
            password: ""
          })
          .expect(400);
})

it('disallows duplicated emails', async () => {

  await request(app)
          .post('/api/users/signup')
          .send({
            email: "rajneesh@gmail.com",
            password: "password"
          })
          .expect(201);

  await request(app)
          .post('/api/users/signup')
          .send({
            email: "rajneesh@gmail.com",
            password: "password"
          })
          .expect(400);
})

// it('sets a cookie after successfull signUp', async () => {
//     const response = await request(app)
//           .post('/api/users/signup')
//           .send({
//             email: "rajneesh@gmail.com",
//             password: "password"
//           })
//           .expect(201);

//     expect(response.get('Set-Cookie'))
//           .toBeDefined();

// })