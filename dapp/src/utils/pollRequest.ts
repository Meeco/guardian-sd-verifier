const pollRequest = (
  func: () => Promise<any>,
  timeOut: number
): Promise<any> => {
  return new Promise((resolve) => {
    // Run the function every 3 seconds
    const interval = setInterval(async () => {
      const res = await func();
      if (res.length > 0) {
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
