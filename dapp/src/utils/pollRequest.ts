import { PresentationResponseMessage, QueryResponseMessage } from "../types";

const pollRequest = (
  func: () => Promise<
    QueryResponseMessage | PresentationResponseMessage | undefined
  >,
  timeOut: number
): Promise<QueryResponseMessage | PresentationResponseMessage | undefined> => {
  return new Promise((resolve) => {
    // Run the function every 3 seconds
    const interval = setInterval(async () => {
      const res = await func();
      console.log({ res });
      if (res) {
        clearInterval(interval);
        resolve(res);
      }
    }, 3000);

    // Stop the interval after reach limit time
    setTimeout(function () {
      clearInterval(interval);
      resolve(undefined);
    }, timeOut);
  });
};

export default pollRequest;
