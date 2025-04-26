import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginSuccess, logout } from "@/features/auth/store/auth-slice";

export function useAuth() {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	useEffect(() => {
		if (!auth.isInitialized) {
			const token = localStorage.getItem("authToken");
			const user = localStorage.getItem("authUser");

			if (token && user) {
				dispatch(
					loginSuccess({
						user: JSON.parse(user),
						token,
					})
				);
			} else {
				dispatch(logout()); // If no token, logout
			}
		}
	}, [dispatch, auth.isInitialized]);

	return {
		...auth, // destructure everything
	};
}
