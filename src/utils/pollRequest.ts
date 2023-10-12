const pollRequest = <T>(
  requestFunction: () => Promise<T>,
  timeOut: number
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    try {
      // Run the function every 3 seconds
      const interval = setInterval(async () => {
        const res = await requestFunction();
        if (res) {
          if (Array.isArray(res)) {
            if (res.length > 0) {
              clearInterval(interval);
              resolve(res);
            }
          } else {
            clearInterval(interval);
            resolve(res);
          }
        }
      }, 3000);

      // Stop the interval after reach limit time
      setTimeout(() => {
        clearInterval(interval);
        resolve(undefined);
      }, timeOut);
    } catch (error) {
      console.log("pollRequest failed: ", error);
    }
  });
};

export default pollRequest;
