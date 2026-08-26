
/* Convert an ISO-standard duration or duration seconds to a sensibly-formatted value. */
function convertDuration(duration: string | number): string {
  if (typeof duration === "number") {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  const DURATION_REGEX = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const dur_match = duration.match(DURATION_REGEX);
  if (dur_match === null) return "00:00";

  const mins: number = parseInt(dur_match[1] ?? "0") * 60 +
    + parseInt(dur_match[2] ?? "0");
  const secs: number = parseInt(dur_match[3] ?? "0");

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};



export default convertDuration;