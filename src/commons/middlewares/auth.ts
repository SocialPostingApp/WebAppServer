import { NextFunction } from "express";
import { verifyToken } from "../utils/auth";

const authMiddleware = (req, res, next: NextFunction) => {
  const authHeader: string = req.headers["authorization"];
  const token: string = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  verifyToken(token, (err: any, user: { _id: string }) => {
    if (err) return res.sendStatus(401);

    req.user = user as { _id: string };
    next();
  });
};

export default authMiddleware;