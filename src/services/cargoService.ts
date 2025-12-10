// src/services/cargoService.js
import { haversineDistance, moveTowards } from "../utils/geoUtils";

const ports = {
  Shanghai: [31.2304, 121.4737],
  Singapore: [1.3521, 103.8198],
  Rotterdam: [51.9225, 4.4792],
  "Los Angeles": [34.0522, -118.2437],
  Dubai: [25.276987, 55.296249],
  "New York": [40.7128, -74.006],
};

const cargoTypes = ["Container", "Bulk", "Liquid", "Refrigerated"];

const generateMockCargoData = (count = 10) => {
  const portNames = Object.keys(ports);

  return Array.from({ length: count }, (_, i) => {
    const origin = portNames[Math.floor(Math.random() * portNames.length)];
    let destination;
    do {
      destination = portNames[Math.floor(Math.random() * portNames.length)];
    } while (destination === origin);

    const [lat, lon] = ports[origin];
    const [destLat, destLon] = ports[destination];
    const distance = haversineDistance(lat, lon, destLat, destLon); // in km
    const speed = 30; // average ship speed in km/h
    const etaMs = (distance / speed) * 60 * 60 * 1000;

    return {
      id: `CARGO-${1000 + i}`,
      type: cargoTypes[Math.floor(Math.random() * cargoTypes.length)],
      status: "In Transit",
      origin,
      destination,
      latitude: lat,
      longitude: lon,
      destLat,
      destLon,
      eta: new Date(Date.now() + etaMs),
      progress: 0,
      speed,
      size: Math.random() * 2 + 2,
    };
  });
};

export const subscribeToCargoMovements = (callback) => {
  let data = generateMockCargoData();

  const interval = setInterval(() => {
    data = data.map((cargo) => {
      if (cargo.status === "Delivered") return cargo;

      const newPosition = moveTowards(
        [cargo.latitude, cargo.longitude],
        [cargo.destLat, cargo.destLon],
        0.2 // movement step in degrees approximation
      );

      const distanceToDest = haversineDistance(
        newPosition[0],
        newPosition[1],
        cargo.destLat,
        cargo.destLon
      );

      if (distanceToDest < 5) {
        return {
          ...cargo,
          latitude: cargo.destLat,
          longitude: cargo.destLon,
          status: "Delivered",
        };
      }

      return {
        ...cargo,
        latitude: newPosition[0],
        longitude: newPosition[1],
      };
    });

    callback(data);
  }, 3000);

  return {
    unsubscribe: () => clearInterval(interval),
  };
};
