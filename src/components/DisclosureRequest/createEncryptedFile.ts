import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { fetchResolveDid } from "../../didService";
import { createFile } from "../../fileService";
import { deriveKeyAgreementKey } from "../../utils";

// Get presentation response from HCS
const createEncryptedFile = async ({
  responderDid,
  encryptedKeyId = "did-root-key",
  presentationRequest,
  signer,
  cipher,
  provider,
  addLoader,
  removeLoader,
}: {
  presentationRequest: any;
  encryptedKeyId: string;
  responderDid: string;
  signer: HashConnectSigner;
  cipher: any;
  provider: any;
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
}) => {
  try {
    addLoader(`createEncryptedFile-${responderDid}`);

    const didDocument = await fetchResolveDid(responderDid);

    // Different key types use a different property
    const verificationKeys = (
      didDocument.publicKey ?? didDocument.verificationMethod
    ).filter(
      (item: any) =>
        encryptedKeyId === item.id ||
        encryptedKeyId === item.id.split("#").pop()
    );

    if (verificationKeys.length < 1) {
      throw new Error(
        `No key found for did document "${responderDid}" matching id "${encryptedKeyId}"`
      );
    }
    const [verificationKey] = verificationKeys;

    const responderKeyAgreement = await deriveKeyAgreementKey(verificationKey);

    const keyResolver = async () => responderKeyAgreement;

    const recipient = {
      header: {
        kid: responderKeyAgreement.id,
        alg: "ECDH-ES+A256KW",
      },
    };

    const encryptedMessage = await cipher.encryptObject({
      obj: presentationRequest,
      recipients: [recipient],
      keyResolver,
    }); // jwe

    const fileId = await createFile(
      signer,
      provider,
      JSON.stringify(encryptedMessage)
    );

    removeLoader(`createEncryptedFile-${responderDid}`);

    return { fileId };
  } catch (error) {
    console.log({ error });
    removeLoader(`createEncryptedFile-${responderDid}`);
    return { fileId: null };
  }
};

export default createEncryptedFile;
