export function getDateTime(): string {
  const dateObject = new Date();

  const date = ("0" + dateObject.getDate()).slice(-2);
  const month = ("0" + (dateObject.getMonth() + 1)).slice(-2);
  const year = dateObject.getFullYear();

  const hours =
    dateObject.getHours() <= 9
      ? "0" + dateObject.getHours()
      : dateObject.getHours();
  const minutes =
    dateObject.getMinutes() <= 9
      ? "0" + dateObject.getMinutes()
      : dateObject.getMinutes();
  const seconds =
    dateObject.getSeconds() <= 9
      ? "0" + dateObject.getSeconds()
      : dateObject.getSeconds();

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}
