import { FileContentsQuery } from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

const getFileContents = async ({
  fileId,
  hcSigner,
}: {
  fileId: string;
  hcSigner: HashConnectSigner;
}) => {
  try {
    //Create the query
    const query = new FileContentsQuery().setFileId(fileId);
    const contents = await query.executeWithSigner(
      hcSigner as unknown as Signer
    );
    return contents;
  } catch (error) {
    console.log("Unable to get file contents");
  }
};

export default getFileContents;
