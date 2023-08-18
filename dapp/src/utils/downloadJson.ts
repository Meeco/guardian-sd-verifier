const downloadJson = (content: any, fileName: string) => {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(content)], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export default downloadJson;
