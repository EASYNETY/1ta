import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
	courseId: string;
	title: string;
	price: number;
	discountPrice?: number;
	image?: string;
	instructor?: string;
}

export interface CartState {
	items: CartItem[];
	total: number;
}

const initialState: CartState = {
	items: [],
	total: 0,
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addItem: (state, action: PayloadAction<CartItem>) => {
			// Check if item already exists
			const existingItem = state.items.find(
				(item) => item.courseId === action.payload.courseId
			);
			if (!existingItem) {
				state.items.push(action.payload);
				state.total += action.payload.discountPrice || action.payload.price;
			}
		},
		removeItem: (state, action: PayloadAction<string>) => {
			const itemToRemove = state.items.find(
				(item) => item.courseId === action.payload
			);
			if (itemToRemove) {
				state.total -= itemToRemove.discountPrice || itemToRemove.price;
				state.items = state.items.filter(
					(item) => item.courseId !== action.payload
				);
			}
		},
		clearCart: (state) => {
			state.items = [];
			state.total = 0;
		},
	},
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartItemCount = (state: { cart: CartState }) =>
	state.cart.items.length;
export const selectCartItemById = (state: { cart: CartState }, id: string) =>
	state.cart.items.find((item) => item.courseId === id);
export const selectCartItemByCourseId = (
	state: { cart: CartState },
	courseId: string
) => state.cart.items.find((item) => item.courseId === courseId);
export const selectCartItemByTitle = (
	state: { cart: CartState },
	title: string
) => state.cart.items.find((item) => item.title === title);
export const selectCartItemByInstructor = (
	state: { cart: CartState },
	instructor: string
) => state.cart.items.find((item) => item.instructor === instructor);

export default cartSlice.reducer;
