import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

export async function login(
  req: Request,
  res: Response
) {
  const token = jwt.sign(
    {
      id: "example"
    },
    process.env.JWT_SECRET as string
  );

  res.json({
    token
  });
}