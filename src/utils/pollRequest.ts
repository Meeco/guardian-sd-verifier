const pollRequest = async <T>(
  requestFunction: () => Promise<T>,
  timeOut: number,
  pollInterval = 3000
): Promise<T | undefined> => {
  const wait = (time: number, result: string) =>
    new Promise((resolve) => setTimeout(() => resolve(result), time));
  const fail = wait(timeOut, "fail");

  let res;
  while (!res) {
    try {
      res = await requestFunction();
    } catch (error) {
      console.log("pollRequest failed: ", error);
    }
    if (res) return res;

    const next = await Promise.race([fail, wait(pollInterval, "retry")]);
    if (next === "fail") throw new Error("Polling time limit exceeded");
  }
};

export default pollRequest;
