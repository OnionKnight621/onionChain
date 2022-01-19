import { ec as EC } from "elliptic";
import cryptoHash from "./cryptoHash";

export const ec = new EC("secp256k1"); //elliptic crypto standart

export const verifySignature = ({ publicKey, data, signature }: any) => {
  // @ts-ignore
  const keyFromPublic = EC.keyFromPublic(publicKey, "hex");

  return keyFromPublic.verify(cryptoHash(data), signature);
};
