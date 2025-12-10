export function getOnTimePercentage(cargoItems) {
  if (!cargoItems || !cargoItems.length) return 0;

  const onTimeCount = cargoItems.filter(
    (item) => item.status === "On Time" || item.status === "Delivered"
  ).length;

  return Math.round((onTimeCount / cargoItems.length) * 100);
}

export function getAverageTransitTime(cargoItems) {
  if (!cargoItems || !cargoItems.length) return "0d";

  const now = Date.now();

  const transitDays = cargoItems
    .filter((item) => item.eta)
    .map((item) => {
      const eta = new Date(item.eta).getTime();
      const daysLeft = Math.max(
        0,
        Math.round((eta - now) / (1000 * 60 * 60 * 24))
      );
      return daysLeft;
    });

  if (!transitDays.length) return "0d";

  const avg = Math.round(
    transitDays.reduce((sum, days) => sum + days, 0) / transitDays.length
  );

  return `${avg}d`;
}

export function getCargoStatusColor(status) {
  switch (status) {
    case "On Time":
      return "#22c55e";
    case "Delayed":
      return "#ef4444";
    case "In Transit":
      return "#60a5fa";
    case "Delivered":
      return "#a78bfa";
    default:
      return "#9ca3af";
  }
}

export function formatDateTime(dateTime) {
  if (!dateTime) return "N/A";
  const date = new Date(dateTime);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}
