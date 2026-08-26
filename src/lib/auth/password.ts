import bcrypt from "bcrypt";
import { createHash } from "crypto";

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 12);

export const verifyPassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const sha256 = (input: string) =>
  createHash("sha256").update(input).digest("hex");
