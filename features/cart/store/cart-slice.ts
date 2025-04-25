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

export default cartSlice.reducer;
