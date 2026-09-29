export type Product = {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number | null;
  imageUrl?: string;
  emoji?: string;
  active: boolean;
  featured: boolean;
  dailySpecial: boolean;
  order: number;
};

export type Category = {
  id: string;
  storeId: string;
  name: string;
  active: boolean;
  order: number;
};

export type StoreSettings = {
  name: string;
  whatsapp: string;
  active: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  minimumOrder: number;
  deliveryFee: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: "entrega" | "retirada";
  address?: string;
  neighborhood?: string;
  reference?: string;
  paymentMethod: "pix" | "dinheiro" | "cartao";
  changeFor?: number | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "novo" | "confirmado" | "preparando" | "saiu_entrega" | "concluido" | "cancelado";
  createdAt?: unknown;
};
