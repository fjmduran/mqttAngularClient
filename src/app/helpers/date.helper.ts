export function formatHour(date: Date): string {
  const formatHour: string = `0${date.getHours()}`.toString().slice(-2);
  const formatMinute: string = `0${date.getMinutes()}`.toString().slice(-2);
  const formatSecond: string = `0${date.getSeconds()}`.toString().slice(-2);

  return `${formatHour}:${formatMinute}:${formatSecond}`;
}
