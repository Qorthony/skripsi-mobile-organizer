import dayjs from "dayjs";

const dateIdFormat = (date: Date | string, full: boolean = false): string => {
  if (!full) {
    return dayjs(date).format('DD MMMM YYYY');
  }
  return dayjs(date).format('DD MMMM YYYY HH:mm:ss')
}

export {
  dateIdFormat,
}