// احسب المسافة بين نقطتين على الكرة الأرضية
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// تحريك النقطة بنسبة بسيطة في اتجاه الوجهة
export const moveTowards = ([lat1, lon1], [lat2, lon2], step = 0.2) => {
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  const dist = Math.sqrt(deltaLat ** 2 + deltaLon ** 2);

  if (dist < step) return [lat2, lon2];

  const ratio = step / dist;
  return [lat1 + deltaLat * ratio, lon1 + deltaLon * ratio];
};
