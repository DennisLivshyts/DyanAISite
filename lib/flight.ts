/**
 * Where the craft is, shared by everything that shows it: the 3D scene, the
 * hero's flight-status panel and the side tracker. One writer (OrbitMount's
 * scroll director), many readers. Readers write to the DOM directly, so a
 * scroll never re-renders React.
 *
 * No three.js here — this stays in the first-load bundle.
 */

import { phaseAt, range, speed, thetaAt, type Phase } from "./orbit";

export type FlightState = {
  s: number;          // flight position 0..1
  th: number;         // true anomaly
  phase: Phase;
  velocity: number;   // 1.00 at the inbound ring crossing
  range: number;      // distance from the body in ring radii
};

const listeners = new Set<(f: FlightState) => void>();
let state: FlightState = at(0);

function at(s: number): FlightState {
  const th = thetaAt(s);
  return { s, th, phase: phaseAt(th), velocity: speed(th), range: range(th) };
}

export const flight = {
  get: () => state,
  set(s: number) {
    if (s === state.s) return;
    state = at(s);
    listeners.forEach((fn) => fn(state));
  },
  subscribe(fn: (f: FlightState) => void) {
    listeners.add(fn);
    fn(state);
    return () => { listeners.delete(fn); };
  },
};
