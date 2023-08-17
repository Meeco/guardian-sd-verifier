import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";

const encryptData = ({
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
  const encryptedMessage = nacl.box(message, nonce, publickey, privatekey);

  return naclUtil.encodeBase64(encryptedMessage);
};

export default encryptData;
