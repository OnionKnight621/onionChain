import { SignatureInput } from "elliptic";
import Wallet from ".";
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

export type createOutputMap = {
  senderWallet: Wallet;
  recipient: string;
  amount: number;
};

// TODO: describe types with dynamic structure
export type outputMap = any;
export type transactionMap = any;