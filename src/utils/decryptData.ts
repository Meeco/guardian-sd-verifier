import * as nacl from "tweetnacl";

const decryptData = ({
  message,
  nonce,
  publickey,
  privatekey,
}: {
  message: Uint8Array;
  nonce: Uint8Array;
  publickey: Uint8Array;
  privatekey: Uint8Array;
}) => {
  const decryptedMessage = nacl.box.open(message, nonce, publickey, privatekey);

  return decryptedMessage;
};

export default decryptData;
