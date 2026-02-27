
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Noodles' | 'Bakso' | 'Pizza' | 'Sushi' | 'Salads' | 'Desserts' | 'Drinks';
  image: string;
  calories: number;
  rating: number;
  isPopular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface AIRecommendation {
  itemId: string;
  reason: string;
}

export type OrderStatus = 'confirming' | 'preparing' | 'searching_driver' | 'on_the_way' | 'arrived' | 'delivered';

export interface OrderInfo {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  eta: number; // minutes
  driver?: {
    name: string;
    rating: number;
    vehicle: string;
    image: string;
  };
  address: string;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  label: string;
  minOrder: number;
  maxDiscount?: number;
}
