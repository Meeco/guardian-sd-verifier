import * as Hedera from "@hashgraph/sdk";
import * as nacl from "tweetnacl";

const generateRequesterKeys = (requesterPrivateKeyHex: string) => {
  const requesterPrivateKeyBytes = Hedera.PrivateKey.fromString(
    requesterPrivateKeyHex
  ).toBytes();

  const requesterEmphem = nacl.box.keyPair.fromSecretKey(
    requesterPrivateKeyBytes
  );

  const requesterKeyPair = nacl.box.keyPair.fromSecretKey(
    requesterPrivateKeyBytes
  );

  return { requesterEmphem, requesterKeyPair };
};

export default generateRequesterKeys;
