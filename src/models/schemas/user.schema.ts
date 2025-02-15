import mongoose from 'mongoose';
import { IUser } from '../interfaces/IUser';

export const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  tokens: { type: [String] },
  image: { type: String, required: false },
});
