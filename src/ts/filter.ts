import moment from "moment";

/**
 * format: YYYY-MM-DD
 * @param unix
 */
export function dateFormat(unix: number): string {
  return moment.unix(unix).format("YYYY-MM-DD");
}

/**
 * format: YYYY-MM-DD A hh:mm:ss
 * @param unix
 */
export function dateTimeFormat(unix: number): string {
  return moment.unix(unix).format("YYYY-MM-DD A hh:mm:ss");
}

/**
 * format: YYYY-MM-DD A hh:mm
 * @param unix
 */
export function dateMinutesFormat(unix: number): string {
  return moment.unix(unix).format("YYYY-MM-DD A hh:mm");
}
