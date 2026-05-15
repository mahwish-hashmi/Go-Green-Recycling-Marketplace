import { CartItem } from './CartItem';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  role?: string;
  cartItems: CartItem[];
}
