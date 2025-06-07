export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export const products: Product[] = [
  { id: 1, name: 'T-shirt', price: 20, image: 'https://via.placeholder.com/200' },
  { id: 2, name: 'Jeans', price: 40, image: 'https://via.placeholder.com/200' },
  { id: 3, name: 'Shoes', price: 60, image: 'https://via.placeholder.com/200' },
];
