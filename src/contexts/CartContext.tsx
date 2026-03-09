import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AddToCartResult, CartContextType, CartItem, Product } from '../shared/models/types';

// ── CartContext ───────────────────────────────────────────────────────────────
// Manages all cart state and exposes it to the component tree via context.
// Cart is persisted to localStorage so items survive a page refresh.

const STORAGE_KEY = 'sristore_cart';
const MAX_QUANTITY = 99;

// ── Helpers ───────────────────────────────────────────────────────────────────

const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown[] = JSON.parse(saved);

    // Validate each item — discard anything that doesn't match the CartItem shape
    const valid = parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        'product' in item &&
        typeof (item as CartItem).product?.id === 'number' &&
        typeof (item as CartItem).product?.price === 'number' &&
        typeof (item as CartItem).quantity === 'number' &&
        (item as CartItem).quantity > 0,
    );

    return valid;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Could not save cart to localStorage:', error);
  }
};

// ── Context ───────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

const CartProvider = ({ children }: { children: ReactNode }) => {
  // Lazy initialiser — reads from localStorage only on the first render
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);

  // Persist cart to localStorage whenever cartItems changes (skip the initial render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // skip the first render — storage was already read in useState init
    }
    saveCartToStorage(cartItems);
  }, [cartItems]);

  // ── Computed values ───────────────────────────────────────────────────────
  // Derived from cartItems with useMemo — only recalculate when cartItems changes

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItems],
  );

  const uniqueItemCount = useMemo(() => cartItems.length, [cartItems]);

  // ── Mutators ──────────────────────────────────────────────────────────────

  const addToCart = useCallback((product: Product): AddToCartResult => {
    if (!product || !product.id) {
      return { success: false, message: 'Invalid product.' };
    }
    if (typeof product.price !== 'number' || product.price <= 0) {
      return { success: false, message: 'This product has an invalid price.' };
    }

    let result: AddToCartResult = { success: true, message: '' };

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (existingItem && existingItem.quantity >= MAX_QUANTITY) {
        result = {
          success: false,
          message: `You can only add up to ${MAX_QUANTITY} of the same item.`,
        };
        return currentItems; // no change
      }

      if (existingItem) {
        // Immutable update — spread to avoid mutating state directly
        result = { success: true, message: `"${product.title}" added to cart!` };
        return currentItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      result = { success: true, message: `"${product.title}" added to cart!` };
      return [...currentItems, { product, quantity: 1 }];
    });

    return result;
  }, []);

  const removeFromCart = useCallback((productId: number): void => {
    setCartItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number): void => {
    if (quantity <= 0) {
      // Remove the item entirely when quantity drops to zero
      setCartItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
      return;
    }

    const safeQuantity = Math.min(quantity, MAX_QUANTITY);

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback((): void => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: number): boolean => cartItems.some((item) => item.product.id === productId),
    [cartItems],
  );

  // ── Context value ─────────────────────────────────────────────────────────

  const value = useMemo<CartContextType>(
    () => ({
      cartItems,
      itemCount,
      totalPrice,
      uniqueItemCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    }),
    [
      cartItems,
      itemCount,
      totalPrice,
      uniqueItemCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

export default CartProvider;
