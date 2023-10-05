import { HashConnect } from "hashconnect";

export const pairWallet = async ({
  hashconnect,
}: {
  hashconnect?: HashConnect;
}) => {
  if (hashconnect) {
    hashconnect.connectToLocalWallet();
  }
};
