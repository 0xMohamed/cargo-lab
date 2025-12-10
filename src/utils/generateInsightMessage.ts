export function generateInsightMessage(data) {
  const total = data.length;

  const onTimeOrDelivered = data.filter(
    (item) => item.status === "On Time" || item.status === "Delivered"
  ).length;

  const delayed = data.filter((item) => item.status === "Delayed").length;
  const inTransit = data.filter((item) => item.status === "In Transit").length;

  if (delayed / total > 0.4) {
    return "⚠️ Many shipments are experiencing delays.";
  }

  if (onTimeOrDelivered / total > 0.8) {
    return "✅ Most shipments are running smoothly!";
  }

  if (inTransit / total > 0.5) {
    return "📦 A lot of cargo is currently in transit.";
  }

  return "🔄 Shipment activity is in motion.";
}
