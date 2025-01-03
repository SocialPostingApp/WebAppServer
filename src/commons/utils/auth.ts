import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const bcrypt = require('bcrypt');

export const encryptPassword = async (password: string) => {
    const salt: string = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    return encryptedPassword;
}

export const generateJWT = async (userId: ObjectId) => {
    const accessToken = await jwt.sign(
                            { '_id': userId },
                            process.env.JWT_SECRET,
                            { expiresIn: process.env.JWT_EXPIRATION }
                        );

    return accessToken;
}

export const verifyToken = (
    token: string,
    callback: (err: any, user: { _id: string }) => void
  ) => {
    jwt.verify(token, process.env.JWT_SECRET, callback);
  };