import {
  Activity,
  Beef,
  Beer,
  Bike,
  Book,
  Cake,
  CakeSlice,
  Calendar,
  Camera,
  Car,
  Cherry,
  Clock,
  Coffee,
  Cookie,
  CupSoda,
  Flag,
  Flame,
  Flower,
  Flower2,
  Gamepad2,
  Gift,
  GlassWater,
  Headphones,
  Heart,
  Home,
  IceCreamCone,
  Lamp,
  Lightbulb,
  type LucideIcon,
  MapPin,
  Megaphone,
  Mic,
  Music,
  Music2,
  Music3,
  Music4,
  Package,
  Palette,
  PartyPopper,
  Pizza,
  Popcorn,
  Sandwich,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Soup,
  Sparkle,
  Sparkles,
  Speaker,
  Star,
  Sun,
  Tent,
  Ticket,
  Timer,
  Trash2,
  TreePine,
  Trees,
  Trophy,
  Truck,
  Users,
  Utensils,
  UtensilsCrossed,
  Video,
  Wine,
  Zap,
} from "lucide-react";

// Define all icon mappings as a const object
const ICON_MAP = {
  // Party & Celebration
  PartyPopper,
  Gift,
  Cake,
  CakeSlice,
  Sparkles,
  Sparkle,
  Star,
  Trophy,
  Heart,
  Ticket,

  // Food & Drinks
  Utensils,
  UtensilsCrossed,
  Pizza,
  Sandwich,
  Soup,
  Cookie,
  Popcorn,
  IceCreamCone,
  Cherry,
  Coffee,
  Beer,
  Wine,
  CupSoda,
  GlassWater,
  Beef,

  // Activities & Entertainment
  Music,
  Music2,
  Music3,
  Music4,
  Headphones,
  Mic,
  Speaker,
  Gamepad: Gamepad2,
  Camera,
  Video,
  Activity,
  Bike,
  Tent,
  Palette,
  Book,

  // Setup & Logistics
  Users,
  Package,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Car,
  Home,
  MapPin,
  Clock,
  Timer,
  Calendar,
  Megaphone,

  // Decorations & Ambiance
  Flower,
  Flower2,
  Sun,
  Lightbulb,
  Lamp,
  Flame,
  Trees,
  TreePine,
  Flag,
  Shirt,

  // Utility
  Zap,
  Trash: Trash2,
} as const;

// Type for valid icon names
export type IconName = keyof typeof ICON_MAP;

// Default icon name
export const DEFAULT_ICON: IconName = "Star";

// Array of available icons for UI selection
export const availableIcons: { icon: LucideIcon; name: IconName }[] = (
  Object.entries(ICON_MAP) as Array<[IconName, LucideIcon]>
).map(([name, icon]) => ({ name, icon }));

// Grouped icons for better UI organization
export const iconGroups = {
  "Party & Celebration": [
    "PartyPopper",
    "Gift",
    "Cake",
    "CakeSlice",
    "Sparkles",
    "Sparkle",
    "Star",
    "Trophy",
    "Heart",
    "Ticket",
  ] as IconName[],
  "Food & Drinks": [
    "Utensils",
    "UtensilsCrossed",
    "Pizza",
    "Sandwich",
    "Soup",
    "Cookie",
    "Popcorn",
    "IceCreamCone",
    "Cherry",
    "Coffee",
    "Beer",
    "Wine",
    "CupSoda",
    "GlassWater",
    "Beef",
  ] as IconName[],
  "Activities & Entertainment": [
    "Music",
    "Music2",
    "Music3",
    "Music4",
    "Headphones",
    "Mic",
    "Speaker",
    "Gamepad",
    "Camera",
    "Video",
    "Activity",
    "Bike",
    "Tent",
    "Palette",
    "Book",
  ] as IconName[],
  "Setup & Logistics": [
    "Users",
    "Package",
    "ShoppingCart",
    "ShoppingBag",
    "Truck",
    "Car",
    "Home",
    "MapPin",
    "Clock",
    "Timer",
    "Calendar",
    "Megaphone",
  ] as IconName[],
  "Decorations & Ambiance": [
    "Flower",
    "Flower2",
    "Sun",
    "Lightbulb",
    "Lamp",
    "Flame",
    "Trees",
    "TreePine",
    "Flag",
    "Shirt",
  ] as IconName[],
  Utility: ["Zap", "Trash"] as IconName[],
} as const;

/**
 * Get the Lucide icon component for a given icon name
 */
export function getIcon(name: IconName | string): LucideIcon {
  return ICON_MAP[name as IconName] || ICON_MAP[DEFAULT_ICON];
}

/**
 * Check if a string is a valid icon name
 */
export function isValidIconName(name: string): name is IconName {
  return name in ICON_MAP;
}

/**
 * Get icon name from a LucideIcon component (for legacy compatibility)
 * @deprecated Use IconName type directly instead
 */
export function getIconName(icon: LucideIcon): IconName {
  const entry = Object.entries(ICON_MAP).find(([, i]) => i === icon);
  return (entry?.[0] as IconName) || DEFAULT_ICON;
}

// For backward compatibility
export const getIconByName = getIcon;
