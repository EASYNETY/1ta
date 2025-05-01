// data/mock-pricing-data.ts

// Define individual plans
export const individualPlans = [
	{
		id: "basic-individual",
		name: "Basic",
		price: "₦25,000",
		priceValue: 25000,
		description: "Perfect for beginners",
		features: [
			"Access to core courses",
			"Basic project support",
			"Community forum access",
			"Email support",
		],
		notIncluded: [
			"Advanced courses",
			"1-on-1 mentorship",
			"Career placement",
			"Certificate of completion",
		],
		popular: false,
		type: "individual",
		active: true,
	},
	{
		id: "pro-individual",
		name: "Pro",
		price: "₦45,000",
		priceValue: 45000,
		description: "Most popular choice",
		features: [
			"Access to all courses",
			"Advanced project support",
			"Community forum access",
			"Priority email support",
			"1-on-1 mentorship (2 sessions)",
			"Certificate of completion",
		],
		notIncluded: ["Career placement"],
		popular: true,
		type: "individual",
		active: true,
	},
	{
		id: "premium-individual",
		name: "Premium",
		price: "₦75,000",
		priceValue: 75000,
		description: "Complete learning experience",
		features: [
			"Access to all courses",
			"Premium project support",
			"Community forum access",
			"24/7 priority support",
			"Unlimited 1-on-1 mentorship",
			"Certificate of completion",
			"Career placement assistance",
			"Exclusive industry events",
		],
		notIncluded: [],
		popular: false,
		type: "individual",
		active: true,
	},
];

// Define corporate plans
export const corporatePlans = [
	{
		id: "team-corporate",
		name: "Team",
		price: "₦200,000",
		priceValue: 200000,
		description: "For small teams (up to 5)",
		features: [
			"Access to all courses for 5 users",
			"Team progress dashboard",
			"Dedicated account manager",
			"Custom learning paths",
			"Certificates for all team members",
		],
		notIncluded: ["Custom course development", "On-site training"],
		popular: false,
		type: "corporate",
		active: true,
	},
	{
		id: "business-corporate",
		name: "Business",
		price: "₦500,000",
		priceValue: 500000,
		description: "For medium businesses (up to 15)",
		features: [
			"Access to all courses for 15 users",
			"Advanced team analytics",
			"Dedicated account manager",
			"Custom learning paths",
			"Certificates for all team members",
			"Quarterly strategy sessions",
			"Basic custom course development",
		],
		notIncluded: ["On-site training"],
		popular: true,
		type: "corporate",
		active: true,
	},
	{
		id: "enterprise-corporate",
		name: "Enterprise",
		price: "Custom",
		priceValue: null,
		description: "For large organizations",
		features: [
			"Unlimited user access",
			"Advanced team analytics",
			"Dedicated account executive",
			"Custom learning paths",
			"Certificates for all team members",
			"Monthly strategy sessions",
			"Full custom course development",
			"On-site training options",
			"API access for LMS integration",
		],
		notIncluded: [],
		popular: false,
		type: "corporate",
		active: true,
	},
];

// Combine all plans
export const allPlans = [...individualPlans, ...corporatePlans];

// Get user subscription
export const getUserSubscription = async (userId: string) => {
	try {
		// Mock implementation
		return {
			id: "sub_123456",
			userId,
			planId: "pro-individual",
			planName: "Pro",
			startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
			expiryDate: new Date(
				Date.now() + 335 * 24 * 60 * 60 * 1000
			).toISOString(), // 335 days from now
			autoRenew: true,
			status: "active",
			paymentHistory: [
				{
					planId: "pro-individual",
					planName: "Pro",
					amount: 45000,
					currency: "NGN",
					status: "completed",
					transactionId: "tx_123456",
					paymentMethod: "card",
					paymentDate: new Date(
						Date.now() - 30 * 24 * 60 * 60 * 1000
					).toISOString(),
				},
			],
		};
	} catch (error) {
		console.error("Error fetching user subscription:", error);
		return null;
	}
};

// Create subscription
export const createSubscription = async (userId: string, planId: string) => {
	try {
		// Mock implementation
		const plan = [...individualPlans, ...corporatePlans].find(
			(p) => p.id === planId
		);
		if (!plan) throw new Error("Plan not found");

		return {
			id: `sub_${Date.now()}`,
			userId,
			planId,
			planName: plan.name,
			startDate: new Date().toISOString(),
			expiryDate: new Date(
				Date.now() + 365 * 24 * 60 * 60 * 1000
			).toISOString(), // 1 year from now
			autoRenew: true,
			status: "active",
			paymentHistory: [
				{
					planId,
					planName: plan.name,
					amount: plan.priceValue || 0,
					currency: "NGN",
					status: "completed",
					transactionId: `tx_${Date.now()}`,
					paymentMethod: "card",
					paymentDate: new Date().toISOString(),
				},
			],
		};
	} catch (error) {
		console.error("Error creating subscription:", error);
		throw error;
	}
};

// Update subscription
export const updateSubscription = async (subscriptionId: string, data: any) => {
	try {
		// Mock implementation
		return {
			...data,
			id: subscriptionId,
			updatedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error updating subscription:", error);
		throw error;
	}
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
	try {
		// Mock implementation
		return {
			id: subscriptionId,
			status: "canceled",
			canceledAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error canceling subscription:", error);
		throw error;
	}
};

// Admin: Get all plans
export const getAllPlans = async () => {
	try {
		// Mock implementation
		return {
			individualPlans,
			corporatePlans,
			allPlans,
		};
	} catch (error) {
		console.error("Error fetching plans:", error);
		throw error;
	}
};

// Admin: Create plan
export const createPlan = async (planData: any) => {
	try {
		// Mock implementation
		return {
			...planData,
			id: `plan_${Date.now()}`,
			createdAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error creating plan:", error);
		throw error;
	}
};

// Admin: Update plan
export const updatePlan = async (planId: string, planData: any) => {
	try {
		// Mock implementation
		return {
			...planData,
			id: planId,
			updatedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error updating plan:", error);
		throw error;
	}
};

// Admin: Delete plan
export const deletePlan = async (planId: string) => {
	try {
		// Mock implementation
		return { success: true, id: planId };
	} catch (error) {
		console.error("Error deleting plan:", error);
		throw error;
	}
};

// Admin: Toggle plan active status
export const togglePlanActive = async (planId: string) => {
	try {
		// Mock implementation
		const plan = [...individualPlans, ...corporatePlans].find(
			(p) => p.id === planId
		);
		if (!plan) throw new Error("Plan not found");

		return {
			...plan,
			active: !plan.active,
			updatedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error toggling plan active status:", error);
		throw error;
	}
};
