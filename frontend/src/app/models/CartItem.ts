// CartItem model — matches the JSON the Spring Boot backend actually returns.
// The backend uses a composite key (CartItemPK) so the structure is nested.
//
// Actual backend JSON looks like:
// {
//   "pk": {
//     "user": { "id": 1, "username": "buyer1", ... },
//     "product": { "id": 3, "name": "Bamboo Bottle", "price": 18.99, ... }
//   },
//   "addedOn": "2024-01-01T10:00:00",
//   "quantity": 2,
//   "totalPrice": 37.98
// }

export interface CartItemProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface CartItemUser {
  id: number;
  username: string;
  name: string;
}

export interface CartItemPK {
  user: CartItemUser;
  product: CartItemProduct;
}

export interface CartItem {
  pk: CartItemPK;
  addedOn: string;
  quantity: number;
  totalPrice: number;
}
