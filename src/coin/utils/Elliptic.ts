import { ec as EC, SignatureInput } from 'elliptic';
import cryptoHash from './cryptoHash';

export const ec = new EC('secp256k1'); //elliptic crypto standart

export type verifySignature = {
  publicKey: string;
  data: any;
  signature: SignatureInput;
};

export const verifySignature = ({
  publicKey,
  data,
  signature,
}: verifySignature) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

  return keyFromPublic.verify(cryptoHash(data), signature);
};
