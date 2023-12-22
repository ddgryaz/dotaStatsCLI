export function getDateTime(): string {
  const dateObject = new Date();

  const date = ("0" + dateObject.getDate()).slice(-2);
  const month = ("0" + (dateObject.getMonth() + 1)).slice(-2);
  const year = dateObject.getFullYear();

  const hours = dateObject.getHours().toString().padStart(2, "0");
  const minutes = dateObject.getMinutes().toString().padStart(2, "0");
  const seconds = dateObject.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}
