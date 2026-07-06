export interface CreateGearPayload {
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  availableQuantity: number;
  imageUrl?: string;
  specifications?: Record<string, unknown>;
  isAvailable?: boolean;
  categoryId: string;
}

export interface GearFilterQuery {
  category?: string;
  price?: string;
  brand?: string;
}