import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";

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

  if (decryptedMessage) return naclUtil.encodeUTF8(decryptedMessage);
};

export default decryptData;
