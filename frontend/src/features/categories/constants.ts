export const CATEGORY_COLORS = [
  { name: "Peach", hex: "#FFD4B2" },
  { name: "Golden", hex: "#FFF3BF" },
  { name: "Teal", hex: "#B2F2E5" },
  { name: "Lavender", hex: "#D4B2FF" },
  { name: "Rose", hex: "#FFB2C8" },
  { name: "Sky Blue", hex: "#B2D4FF" },
  { name: "Mint", hex: "#B2FFD4" },
  { name: "Coral", hex: "#FFB2B2" },
  { name: "Lemon", hex: "#F0FFB2" },
  { name: "Periwinkle", hex: "#B2B2FF" },
  { name: "Blush", hex: "#FFD4D4" },
  { name: "Sage", hex: "#D4E8C2" },
] as const;

export const DEFAULT_COLOR = CATEGORY_COLORS[0].hex;
