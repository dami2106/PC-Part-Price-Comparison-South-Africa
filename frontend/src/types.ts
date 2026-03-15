export interface StoreOption {
  store: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
}

export interface ProductGroup {
  model_id: string;
  canonical_title: string;
  category: string;
  min_price: number;
  score: number;
  stores: StoreOption[];
}

export interface BuildComponent {
  category: string;
  title: string;
  store: string;
  price: number;
  url: string;
  image_url: string;
}

export interface Build {
  id: string;
  name: string;
  components: Record<string, BuildComponent | null>;
  created_at: string;
  updated_at: string;
}

export interface BuildSummary {
  id: string;
  name: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CategorySlot {
  key: string;
  label: string;
  icon: string; // SVG path
}

export const BUILD_CATEGORIES: CategorySlot[] = [
  {
    key: "CPU",
    label: "Processor",
    icon: "M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2m0 0V7m0 0h2m-2 0v10m0 0h2m-2 0v2a2 2 0 01-2 2h-2m0 0H9m6 0v-2M9 21H7a2 2 0 01-2-2v-2m0 0H3m2 0v-4m0 4v-6M3 9H1m2 0V7m0 2h16M3 15H1m2 0v2",
  },
  {
    key: "Motherboard",
    label: "Motherboard",
    icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  },
  {
    key: "GPU",
    label: "Graphics Card",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    key: "RAM",
    label: "Memory",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    key: "Storage",
    label: "Storage",
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  },
  {
    key: "PSU",
    label: "Power Supply",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    key: "Chassis",
    label: "Case",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    key: "Cooler",
    label: "CPU Cooler",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    key: "Monitor",
    label: "Monitor",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    key: "Keyboard",
    label: "Keyboard",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    key: "Mouse",
    label: "Mouse",
    icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
  },
];

// Store colors — light + dark variants (all strings must be present for Tailwind JIT)
export const STORE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  DreamWareTech: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  Evetech: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
  Rebeltech: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  Takealot: {
    bg: "bg-green-50 dark:bg-green-950/40",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
  },
  Wootware: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
  },
  Progenix: {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
  },
  Titanice: {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
};

export const CATEGORY_CHART_COLORS: Record<string, string> = {
  CPU: "#f59e0b",
  GPU: "#6366f1",
  RAM: "#10b981",
  Storage: "#3b82f6",
  Motherboard: "#8b5cf6",
  PSU: "#ef4444",
  Chassis: "#64748b",
  Cooler: "#06b6d4",
  Monitor: "#ec4899",
  Keyboard: "#f97316",
  Mouse: "#84cc16",
};

export interface CommunityBuild {
  id: string;
  name: string;
  author: string;
  description: string;
  total_price: number;
  component_count: number;
  components: Record<string, BuildComponent | null>;
  published_at: string;
  likes: number;
}

export function formatPrice(price: number): string {
  return `R ${price.toLocaleString("en-ZA")}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
