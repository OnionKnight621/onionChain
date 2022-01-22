import { SignatureInput } from "elliptic";
import Block from "../blockchain/Block";

export type createTransactionInput = {
  recipient: string;
  amount: number;
  chain?: Block[];
};

export type input = {
  timestamp: number;
  amount: number;
  address: string;
  signature: SignatureInput;
};

export type outputMap = any;
