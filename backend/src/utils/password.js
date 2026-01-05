import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hash = async (plain) => bcrypt.hash(plain, SALT_ROUNDS);
export const compare = async (plain, hashed) => bcrypt.compare(plain, hashed);

export default { hash, compare };
//Hash & compare
