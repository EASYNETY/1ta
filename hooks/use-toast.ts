import { toast } from "sonner";

type ToastProps = {
	title?: string;
	description?: string;
	variant?: "default" | "destructive" | "success";
};

export const useToast = () => {
	const showToast = ({
		title,
		description,
		variant = "default",
	}: ToastProps) => {
		if (variant === "destructive") {
			toast.error(title, {
				description,
			});
		} else if (variant === "success") {
			toast.success(title, {
				description,
			});
		} else {
			toast(title, {
				description,
			});
		}
	};

	return {
		toast: showToast,
	};
};
