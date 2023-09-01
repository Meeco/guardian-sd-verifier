import * as Hedera from "@hashgraph/sdk";
import * as nacl from "tweetnacl";

export interface RequesterPrivateKey {
  requesterEmphem: nacl.BoxKeyPair;
  requesterKeyPair: nacl.BoxKeyPair;
  privateKeyStr: string;
}

const generateRequesterKeys = (requesterPrivateKeyStr: string) => {
  const { length } = requesterPrivateKeyStr;
  if (length === 66) {
    const firstTwoChar = requesterPrivateKeyStr.slice(0, 2);
    if (firstTwoChar === "0x") {
      const privateKeyHex = requesterPrivateKeyStr.slice(2);
      const privateKeyBytes = Buffer.from(privateKeyHex, "hex");

      const requesterEmphem = nacl.box.keyPair.fromSecretKey(privateKeyBytes);

      const requesterKeyPair = nacl.box.keyPair.fromSecretKey(privateKeyBytes);

      const requesterPrivateKey: RequesterPrivateKey = {
        requesterEmphem,
        requesterKeyPair,
        privateKeyStr: privateKeyHex,
      };

      return requesterPrivateKey;
    } else {
      throw new Error("Incorrect private key");
    }
  }

  if (length === 96) {
    const privateKeyDer = Hedera.PrivateKey.fromString(requesterPrivateKeyStr);

    const requesterEmphem = nacl.box.keyPair.fromSecretKey(
      privateKeyDer.toBytes()
    );

    const requesterKeyPair = nacl.box.keyPair.fromSecretKey(
      privateKeyDer.toBytes()
    );

    const requesterPrivateKey: RequesterPrivateKey = {
      requesterEmphem,
      requesterKeyPair,
      privateKeyStr: privateKeyDer.toStringDer(),
    };

    return requesterPrivateKey;
  } else
    throw new Error(
      `The size of the private key is incorrect. Expected 131 or 132 chars got ${length}`
    );
};

export default generateRequesterKeys;
