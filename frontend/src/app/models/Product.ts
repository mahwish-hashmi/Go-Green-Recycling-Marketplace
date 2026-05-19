export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  addedOn?: string;
  image?: string;           // base64 bytes from backend
  imageUrl?: string | null; // computed on frontend: 'data:image/jpeg;base64,...'
  sellerUsername?: string;  // which seller owns this product
}