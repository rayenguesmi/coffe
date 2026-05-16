import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.id !== productId));

  const updateQty = (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    setItems((prev) => prev.map((i) => i.id === productId ? { ...i, quantity } : i));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count: items.reduce((n, i) => n + i.quantity, 0) }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
