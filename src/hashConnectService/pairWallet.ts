import { HashConnect } from "hashconnect";

export const pairWallet = async (hashconnect?: HashConnect) => {
  if (hashconnect) {
    hashconnect.connectToLocalWallet();
  }
};
