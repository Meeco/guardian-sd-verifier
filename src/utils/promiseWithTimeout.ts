export const promiseWithTimeout = <T>({
  promise,
  time,
  errorMessage = "Promise timed out",
}: {
  promise: Promise<T>;
  time: number;
  errorMessage?: string;
}) => {
  // create a promise that rejects in milliseconds
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, time);
  });

  // returns a race between timeout and the passed promise
  return Promise.race<T>([promise, timeout]);
};
