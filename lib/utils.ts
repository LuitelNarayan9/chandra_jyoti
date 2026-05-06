import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PLACEHOLDERS = {
  STATE: [
    "https://images.unsplash.com/photo-1542640244-7e672d6cb466?q=80&w=800&auto=format&fit=crop", // Sikkim
    "https://images.unsplash.com/photo-1589802829985-817e51171b92?q=80&w=800&auto=format&fit=crop", // Mountains
    "https://images.unsplash.com/photo-1623157451556-9a5c8897db67?q=80&w=800&auto=format&fit=crop", // Gangtok
  ],
  NATIONAL: [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop", // India
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=800&auto=format&fit=crop", // Map
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop", // Delhi
  ],
  INTERNATIONAL: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop", // Globe
    "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=800&auto=format&fit=crop", // Map
    "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=800&auto=format&fit=crop", // Earth
  ],
  DEFAULT: [
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop", // News
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop", // Newspaper
  ]
};

function getPlaceholderIndex(id: string, arrayLength: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % arrayLength;
}

export function getFallbackImage(category: string, id: string) {
  const images = PLACEHOLDERS[category as keyof typeof PLACEHOLDERS] || PLACEHOLDERS.DEFAULT;
  const index = getPlaceholderIndex(id, images.length);
  return images[index];
}
