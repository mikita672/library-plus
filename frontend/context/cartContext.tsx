import { createContext, useEffect, useState } from "react";

export interface ICartContext {
    bookIds: string[] | null,
    addBook: (id: string) => void,
    removeBook: (id: string) => void,
}

const cartKey = "cartKey";

export const cartContext = createContext({} as ICartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [bookIds, setBookIds] = useState<string[] | null>(null);

    useEffect(() => {
        (async () => {
            const savedCartString = localStorage.getItem(cartKey);
            if (savedCartString === null) {
                setBookIds([]);
                return;
            }
            const savedCart: ICartContext = await JSON.parse(savedCartString);
            if (!savedCart.bookIds) {
                setBookIds([]);
                return;
            }
            setBookIds(savedCart.bookIds);
        })()
    }, []);

    const addBook = (id: string) => {
        setBookIds(prev => {
            if (prev === null) return null;
            if (prev.includes(id)) return prev;
            const newBookIds = [...prev, id];
            localStorage.setItem(cartKey, JSON.stringify({ bookIds: newBookIds }));
            return newBookIds;
        });
    }

    const removeBook = (id: string) => {
        setBookIds(prev => {
            if (prev === null) return null;
            const newBookIds = prev.filter(bookId => bookId !== id);
            localStorage.setItem(cartKey, JSON.stringify({ bookIds: newBookIds }));
            return newBookIds;
        });
    }

    return (
        <cartContext.Provider value={{ bookIds, addBook, removeBook }}>
            {children}
        </cartContext.Provider>
    )
}