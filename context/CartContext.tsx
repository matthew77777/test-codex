import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  increaseQty: (productId: number) => void;
  decreaseQty: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(current => current.filter(item => item.id !== productId));
  };

  const increaseQty = (productId: number) => {
    setItems(current =>
      current.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (productId: number) => {
    setItems(current =>
      current
        .map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
