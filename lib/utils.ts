import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic muted tint per client, picked from a small warm palette.
const AVATAR_TINTS = [
  { bg: "#F7E6DF", fg: "#8A4A3A" },
  { bg: "#EEE6D9", fg: "#6E5A36" },
  { bg: "#E3ECE4", fg: "#3F6248" },
  { bg: "#E7E2EF", fg: "#4B3F6E" },
  { bg: "#F4E2E2", fg: "#8A4447" },
  { bg: "#E2ECEF", fg: "#3C5C6B" },
];

export function tintFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}
