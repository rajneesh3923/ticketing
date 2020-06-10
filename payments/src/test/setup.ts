import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {app} from '../app';
import request  from 'supertest';
import jwt from 'jsonwebtoken';



declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper.ts')

let mongo: any;
beforeAll( async () => {
  jest.clearAllMocks();

  process.env.JWT_KEY="asdf"

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser:true,
    useUnifiedTopology: true
  })
})


beforeEach( async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
      await collection.deleteMany({});
  }
})

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
})


global.signin = (id?: string) => {

 //Build a JWT payload. {id, email};

 const payload = {
   id: id || mongoose.Types.ObjectId().toHexString(),
   email: "test@test.com"
 }

 // Create the JWT!

 const token = jwt.sign(payload, process.env.JWT_KEY!);

 //Build Sesstion Object

 const session = {
   jwt: token
 }

 // Turn that session into JSON

 const sessionJSON = JSON.stringify(session);

 // TAKe JSON and encode it as base64

 const base64 = Buffer.from(sessionJSON).toString('base64');

 // return a string thats the cookie with encoded data

 return [`express:sess=${base64}`]

}