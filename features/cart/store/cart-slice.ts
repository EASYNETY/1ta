import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
	courseId: string;
	classId?: string; // Added for class-based enrolment
	title: string;
	priceNaira: number;
	discountPriceNaira?: number;
	image?: string;
	instructor?: string;
}

export interface CartState {
	items: CartItem[];
	total: number;
	taxAmount: number;
	totalWithTax: number;
}

const TAX_RATE = 0.0; // 7.5% tax rate

const initialState: CartState = {
	items: [],
	total: 0,
	taxAmount: 0,
	totalWithTax: 0,
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addItem: (state, action: PayloadAction<CartItem>) => {
			// Check if item already exists - match by classId if available, otherwise by courseId
			const existingItem = action.payload.classId
				? state.items.find(item => item.classId === action.payload.classId)
				: state.items.find(item => item.courseId === action.payload.courseId);

			if (!existingItem) {
				state.items.push(action.payload);
				state.total += action.payload.priceNaira;
				state.taxAmount = state.total * TAX_RATE;
				state.totalWithTax = state.total + state.taxAmount;
			}
		},
		removeItem: (state, action: PayloadAction<{ id: string, isClassId?: boolean }>) => {
			// Find item by classId or courseId based on isClassId flag
			const itemToRemove = action.payload.isClassId
				? state.items.find(item => item.classId === action.payload.id)
				: state.items.find(item => item.courseId === action.payload.id);

			if (itemToRemove) {
				state.total -= itemToRemove.priceNaira;
				state.items = action.payload.isClassId
					? state.items.filter(item => item.classId !== action.payload.id)
					: state.items.filter(item => item.courseId !== action.payload.id);
				state.taxAmount = state.total * TAX_RATE;
				state.totalWithTax = state.total + state.taxAmount;
			}
		},
		clearCart: (state) => {
			state.items = [];
			state.total = 0;
			state.taxAmount = 0;
			state.totalWithTax = 0;
		},
	},
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartTaxAmount = (state: { cart: CartState }) => state.cart.taxAmount;
export const selectCartTotalWithTax = (state: { cart: CartState }) => state.cart.totalWithTax;
export const selectCartItemCount = (state: { cart: CartState }) =>
	state.cart.items.length;
export const selectCartItemById = (state: { cart: CartState }, id: string) =>
	state.cart.items.find((item) => item.courseId === id);
export const selectCartItemByCourseId = (
	state: { cart: CartState },
	courseId: string
) => state.cart.items.find((item) => item.courseId === courseId);
export const selectCartItemByClassId = (
	state: { cart: CartState },
	classId: string
) => state.cart.items.find((item) => item.classId === classId);
export const selectCartItemByTitle = (
	state: { cart: CartState },
	title: string
) => state.cart.items.find((item) => item.title === title);
export const selectCartItemByInstructor = (
	state: { cart: CartState },
	instructor: string
) => state.cart.items.find((item) => item.instructor === instructor);

export default cartSlice.reducer;
