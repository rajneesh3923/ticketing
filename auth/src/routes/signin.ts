import express, {Request, Response, NextFunction} from "express";
import { body } from 'express-validator';
import { User } from '../models/user';

import { validateRequest, BadRequest } from "@mytickets/common";

import { Password } from "../services/password";
import jwt from 'jsonwebtoken';


const router = express.Router();

router.post("/api/users/signin",[

  body('email')
    .isEmail()
    .withMessage('Email must be valid'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password must be provided')


], validateRequest, async (req: Request, res: Response, next: NextFunction) => {


    const  {email, password} = req.body;

    const existingUsers = await User.findOne({email});
    if(!existingUsers) {
      return next (new BadRequest('Invalid Credentials'));
    }

    const passwordsMatch = await Password.compare(existingUsers.password, password);
    
    if(!passwordsMatch) {
       return next (new BadRequest('Invalid Credentials'));
    }

      const userJwt = jwt.sign({
    id: existingUsers.id,
    email: existingUsers.email
  }, process.env.JWT_KEY!)

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUsers);

});

export { router as signInRouter };
