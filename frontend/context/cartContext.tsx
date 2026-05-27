import { useEffect, useState } from "react";
import { createContext } from "vm"

export interface Cart {
    bookIds: string[],
    addBook: (id: string) => void,
}

const cartKey = "cartKey";

export const cartContext = createContext({} as Cart);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [bookIds, setBookIds] = useState<string[] | null>(null);

    useEffect(() => {
        (async () => {
            const savedCartString = localStorage.getItem(cartKey);
            if (savedCartString === null) {
                setBookIds([]);
                return;
            }
            const savedCart: Cart = await JSON.parse(savedCartString);
            if (!savedCart.bookIds) {
                setBookIds([]);
                return;
            }
            setBookIds(savedCart.bookIds);
        })()
    }, []);

    const addBook = (id: string) => {
        if (bookIds?.includes(id)) {
            return;
        }
        setBookIds(prev => {
            if (prev === null) {
                return prev;
            }
            return [...prev, id];
        })
        localStorage.setItem(cartKey, JSON.stringify({ bookIds }))
    }

    return (
        <cartContext.Provider value={{ bookIds, addBook }}>
            {children}
        </cartContext.Provider>
    )
}