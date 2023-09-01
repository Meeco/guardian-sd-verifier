import * as Hedera from "@hashgraph/sdk";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";

export function requesterToResponder() {
  const responderPrivateKeyHex =
    "302e020100300506032b657004220420edd56e1aac0e19df3002f67b02d3fd134f67fc25a8882e1f83bcb1110052b7be";
  const responderPrivateKeyBytes = Hedera.PrivateKey.fromString(
    responderPrivateKeyHex
  ).toBytes();
  const responderKeyPair = nacl.box.keyPair.fromSecretKey(
    responderPrivateKeyBytes
  );

  const responderEmphem = nacl.box.keyPair.fromSecretKey(
    responderPrivateKeyBytes
  );
  // sends: requesterEmphem.publicKey

  // requester does:
  const requesterPrivateKeyHex =
    "302e020100300506032b657004220420d333af857a275642d52b4c215a70e409efdb5d86bb4b04c00c3de4e8eab292f0";
  const requesterPrivateKeyBytes = Hedera.PrivateKey.fromString(
    requesterPrivateKeyHex
  ).toBytes();

  const requesterEmphem = nacl.box.keyPair.fromSecretKey(
    requesterPrivateKeyBytes
  );

  const requesterKeyPair = nacl.box.keyPair.fromSecretKey(
    requesterPrivateKeyBytes
  );
  // sends: requesterEmphem.publicKey

  // const requesterDHPublicKey = ed2curve.convertPublicKey(requesterPublicKeyBytes)
  // const requesterDHPrivateKey = ed2curve.convertSecretKey(requesterPrivateKeyBytes)

  // Responder

  // Encryption
  const message = naclUtil.decodeUTF8("Keep silence");
  const nonce = Buffer.from("GFH4T1fYfIKakVOn37HNYFUCBdmGX6pM", "base64");
  const encryptedMessage = nacl.box(
    message,
    nonce,
    responderEmphem.publicKey!,
    requesterEmphem.secretKey
  );

  const encryptedMessageStr = new TextDecoder().decode(encryptedMessage);

  console.log({ encryptedMessage: naclUtil.encodeBase64(encryptedMessage) });

  const decryptedMessage = nacl.box.open(
    encryptedMessage,
    nonce,
    requesterEmphem.publicKey,
    responderKeyPair.secretKey
  );

  console.log({
    decryptedMessage: decryptedMessage
      ? naclUtil.encodeUTF8(decryptedMessage)
      : "",
  });

  const responseData = respodnerToRequestor(requesterEmphem.publicKey);

  const decryptedResponder = nacl.box.open(
    responseData,
    nonce,
    responderEmphem.publicKey,
    requesterKeyPair.secretKey
  );

  console.log({
    decryptedResponder: decryptedResponder
      ? naclUtil.encodeUTF8(decryptedResponder)
      : "",
  });
}

function respodnerToRequestor(requestorPublicKeyEphem: any) {
  const responderPrivateKeyHex =
    "302e020100300506032b657004220420edd56e1aac0e19df3002f67b02d3fd134f67fc25a8882e1f83bcb1110052b7be";
  const responderPrivateKeyBytes = Hedera.PrivateKey.fromString(
    responderPrivateKeyHex
  ).toBytes();
  const responderKeyPair = nacl.box.keyPair.fromSecretKey(
    responderPrivateKeyBytes
  );

  const message = naclUtil.decodeUTF8("From Responder");
  const nonce = Buffer.from("GFH4T1fYfIKakVOn37HNYFUCBdmGX6pM", "base64");
  const encryptedMessage = nacl.box(
    message,
    nonce,
    requestorPublicKeyEphem,
    responderKeyPair.secretKey
  );

  console.log({ encryptedResponder: naclUtil.encodeBase64(encryptedMessage) });

  return encryptedMessage;
}
