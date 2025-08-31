// src/utils/riderSimulator.js
import { createSocket } from "./socket";

/**
 * Simple linear interpolator simulator that emits `rider:updateLocation`
 * Exports:
 *  - startSimulator(opts) -> returns simulatorId (string)
 *  - stopSimulator(simulatorId)
 *  - stopAllSimulators()
 *
 * opts:
 *  - riderId (string) REQUIRED
 *  - token (optional) raw token or "Bearer <token>"
 *  - from: { lat, lng } (optional, default nearby city center)
 *  - to: { lat, lng } REQUIRED (if not, simulator will move small offset)
 *  - steps: number (default 40)
 *  - stepSeconds: number (seconds per step) default 3
 */

const simulators = {}; // simulatorId -> { socket, timer }

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function computeBearing(a, b) {
  // returns bearing degrees from a->b
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const λ1 = toRad(a.lng);
  const λ2 = toRad(b.lng);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const brng = Math.atan2(y, x);
  return (toDeg(brng) + 360) % 360;
}

function haversineMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const s1 = Math.sin(Δφ/2), s2 = Math.sin(Δλ/2);
  const aa = s1*s1 + Math.cos(φ1)*Math.cos(φ2)*s2*s2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  return R * c;
}

export function startSimulator({
  riderId,
  token,
  from,
  to,
  steps = 40,
  stepSeconds = 3,
  loop = false, // whether to loop back and repeat
} = {}) {
  if (!riderId) throw new Error("riderId is required");
  // normalized token
  const socket = createSocket(token);

  const simId = uid();

  // default from if missing
  if (!from) from = { lat: 22.5726, lng: 88.3639 };

  // default to small offset if missing
  if (!to) to = { lat: from.lat + 0.01, lng: from.lng + 0.01 };

  let stepIndex = 0;
  const totalSteps = Math.max(1, Number(steps) || 40);
  const intervalMs = Math.max(200, (Number(stepSeconds) || 3) * 1000);

  // precompute path points
  const points = [];
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const lat = from.lat + (to.lat - from.lat) * t;
    const lng = from.lng + (to.lng - from.lng) * t;
    points.push({ lat, lng });
  }

  socket.on("connect", () => {
    console.log("[sim] connected socket", socket.id, "simId", simId);
    // join rider room (optional)
    try { socket.emit("joinRider", riderId); } catch (e) {}
  });

  socket.on("connect_error", (err) => {
    console.warn("[sim] socket connect_error", err?.message || err);
  });

  // start interval
  const timer = setInterval(() => {
    // pick point
    const p = points[stepIndex];
    const next = points[Math.min(stepIndex + 1, points.length - 1)];
    const bearing = computeBearing(p, next);
    const meters = haversineMeters(p, next);
    const speedMps = (meters / Math.max(0.001, intervalMs / 1000));
    const speedKmh = Math.round((speedMps * 3.6) * 10) / 10;

    const payload = {
      riderId,
      lat: Number(p.lat),
      lng: Number(p.lng),
      heading: Math.round(bearing),
      speed: speedKmh,
      ts: Date.now(),
    };

    // Emit the event expected by backend
    try {
      socket.emit("rider:updateLocation", payload);
      // also emit a convenience event name some frontends expect
      socket.emit("riderLocation", { riderId, lat: payload.lat, lng: payload.lng });
    } catch (e) {
      console.warn("[sim] emit error", e);
    }

    stepIndex += 1;
    if (stepIndex >= points.length) {
      if (loop) {
        stepIndex = 0;
      } else {
        // finished
        stopSimulator(simId);
      }
    }
  }, intervalMs);

  simulators[simId] = { socket, timer, riderId };
  return simId;
}

export function stopSimulator(simIdOrRiderId) {
  // allow stopping by simulator id or riderId
  const key = Object.keys(simulators).find(k => k === simIdOrRiderId || simulators[k].riderId === simIdOrRiderId);
  if (!key) return false;
  const entry = simulators[key];
  clearInterval(entry.timer);
  try { entry.socket.disconnect(); } catch (e) {}
  delete simulators[key];
  console.log("[sim] stopped", key);
  return true;
}

export function stopAllSimulators() {
  Object.keys(simulators).forEach((k) => {
    try { clearInterval(simulators[k].timer); simulators[k].socket.disconnect(); } catch (e) {}
    delete simulators[k];
  });
}
