export function formatDateShort(dateStr) {
  if (!dateStr) return null;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  try {
    // Replace slashes with dashes to normalize the date format
    const normalizedDateStr = dateStr.replace(/\//g, "-");
    const [year, month, day] = normalizedDateStr
      .split("-")
      .map((val) => parseInt(val, 10));
    if (!year || !month || !day) return null;
    return `${day} ${months[month - 1]}`; // Format as "dd MMM"
  } catch {
    return null; // Return null for parsing errors
  }
}
