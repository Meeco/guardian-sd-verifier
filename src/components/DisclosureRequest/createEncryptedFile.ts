import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { fetchResolveDid } from "../../didService";
import { createFile } from "../../fileService";
import { deriveKeyAgreementKey } from "../../utils";
import { NetworkType } from "../AppProvider";
import { handlePollTransactionDetails } from "./handlePollTransactionDetails";

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
  loaderId,
  network,
}: {
  presentationRequest: any;
  encryptedKeyId: string;
  responderDid: string;
  signer: HashConnectSigner;
  cipher: any;
  provider: any;
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  loaderId: string;
  network: NetworkType;
}) => {
  try {
    addLoader(loaderId);

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

    const transactionId = await createFile(
      signer,
      provider,
      JSON.stringify(encryptedMessage)
    );

    if (transactionId) {
      const tx = await handlePollTransactionDetails({
        transactionId: transactionId?.toString(),
        network,
      });

      removeLoader(loaderId);
      const fileId = tx.entity_id;

      return fileId;
    }
  } catch (error) {
    console.log({ error });
    removeLoader(loaderId);
    return null;
  }
};

export default createEncryptedFile;
