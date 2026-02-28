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
}

export const BUILD_CATEGORIES: CategorySlot[] = [
  { key: "CPU", label: "Processor" },
  { key: "Motherboard", label: "Motherboard" },
  { key: "GPU", label: "Graphics Card" },
  { key: "RAM", label: "Memory" },
  { key: "Storage", label: "Storage" },
  { key: "PSU", label: "Power Supply" },
  { key: "Chassis", label: "Case" },
  { key: "Cooler", label: "CPU Cooler" },
  { key: "Monitor", label: "Monitor" },
  { key: "Keyboard", label: "Keyboard" },
  { key: "Mouse", label: "Mouse" },
];

export const STORE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DreamWareTech: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Evetech: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  Rebeltech: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  Takealot: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Wootware: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  Progenix: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  Titanice: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
};

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
