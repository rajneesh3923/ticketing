import mongoose, { mongo } from 'mongoose';
import { Password } from '../services/password';


// An interface that describes the properties required to create a new User

interface UserAttr {
  email: string;
  password: string;
}

//An interface that describes the properties that a user model have

interface UserModel extends mongoose.Model<UserDoc> {
  build: (attrs: UserAttr) => UserDoc
}

//An interface that describes the properties that a User document has

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const Schema = mongoose.Schema;


const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform: (doc,ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;

    }
  }
})

userSchema.pre('save', async function(done){
    if(this.isModified('password')) {
      const hashed  = await Password.toHash(this.get('password'));
      this.set('password', hashed); 
    }
    done();
})

userSchema.statics.build = (attrs: UserAttr) => {
  return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


export { User }
