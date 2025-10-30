import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "cart";

const defaultInitialState = {
  items: [],
};

function getInitialState() {
  try {
    const storedState = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedState) {
      return defaultInitialState;
    }
    const parsedState = JSON.parse(storedState);
    if (Array.isArray(parsedState?.items)) {
      return parsedState;
    }
  } catch (e) {
    console.error("Failed to parse cart from localStorage", e);
  }
  return defaultInitialState;
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const item = action.payload;
      const existingIndex = state.items.findIndex((i) => i.id === item.id);
      let newItems;

      if (existingIndex > -1) {
        newItems = state.items.map((i, index) =>
          index === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      return { ...state, items: newItems };
    }

    case "REMOVE_ITEM": {
      const id = action.payload.id;
      return {
        ...state,
        items: state.items.filter((i) => i.id !== id),
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      const newQuantity = Math.max(0, quantity);

      if (newQuantity === 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== id),
        };
      }

      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        ),
      };
    }

    case "CLEAR_CART": {
      return defaultInitialState;
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const totalItems = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalPrice = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items: state.items,
      totalItems,
      totalPrice,

      addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: { id } }),
      updateQuantity: (id, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}