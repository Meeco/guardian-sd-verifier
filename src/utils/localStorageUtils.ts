export const setLocalStorage = (key: string, value: any) => {
  if (value !== null && value !== undefined && value !== "") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getLocalStorage = (key: string) => {
  try {
    const value = window.localStorage.getItem(key);
    if (value) return JSON.parse(value);
  } catch (error) {
    console.log(`getLocalStorage error: key "${key}", ${error}`);
  }
};
