export function displayTimeDifferent(startTime: any, endTime: any) {
  // Calculate difference in milliseconds
  const diffMilliseconds = endTime - startTime;

  // Convert milliseconds to seconds and minutes
  const diffSecondsTotal = Math.floor(diffMilliseconds / 1000);
  const minutes = Math.floor(diffSecondsTotal / 60);
  const seconds = diffSecondsTotal % 60;

  // Format minutes and seconds to always show two digits
  const formattedDifference = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  return formattedDifference;
}
