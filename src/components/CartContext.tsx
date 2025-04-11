import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';

export interface CartContextType {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType>({cart: [], setCart: () => {}});

export function useCart(): CartContextType {
    return useContext(CartContext);
}

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    return (
        <CartContext.Provider value={{cart, setCart}}>
            {children}
        </CartContext.Provider>
    );
};