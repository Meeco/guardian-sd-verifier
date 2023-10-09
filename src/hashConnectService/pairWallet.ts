import { HashConnect } from "hashconnect/dist/cjs/main";

export const pairWallet = async (hashconnect?: HashConnect) => {
  if (hashconnect) {
    hashconnect.connectToLocalWallet();
  }
};
