import { Client, FileContentsQuery } from "@hashgraph/sdk";

const getFileContents = async ({
  fileId,
  client,
}: {
  fileId: string;
  client: Client;
}) => {
  try {
    //Create the query
    const query = new FileContentsQuery().setFileId(fileId);
    const contents = await query.execute(client);
    return contents;
  } catch (error) {
    console.log("Unable to get file contents");
  }
};

export default getFileContents;
