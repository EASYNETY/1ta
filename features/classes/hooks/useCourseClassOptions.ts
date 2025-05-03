// hooks/useCourseClassOptions.ts (or wherever you define this hook)

import { useState, useEffect } from "react"; // Import if you plan to make it asynchronous later

export type CourseClassOption = {
	id: string;
	courseName: string;
	sessionName: string;
};

// Define the return type of the hook
export type UseCourseClassOptionsReturn = {
	options: CourseClassOption[];
	isLoading: boolean;
	// You could add error state here too if fetching from an API
	// error: string | null;
};

// Hardcoded mock data version
export const useCourseClassOptions = (): UseCourseClassOptionsReturn => {
	// In a real scenario, you'd fetch this data and have loading/error states
	const [isLoading, setIsLoading] = useState(false); // Set to true initially if fetching async
	// const [error, setError] = useState<string | null>(null);

	const mockOptions: CourseClassOption[] = [
		{ id: "1", courseName: "Frontend Web Development", sessionName: "Morning" },
		{
			id: "2",
			courseName: "Backend API Engineering",
			sessionName: "Afternoon",
		},
		{ id: "3", courseName: "UI/UX Design Principles", sessionName: "Evening" },
		{ id: "4", courseName: "Mobile App Development", sessionName: "Morning" },
		{
			id: "5",
			courseName: "Data Structures & Algorithms",
			sessionName: "Afternoon",
		},
		{
			id: "6",
			courseName: "Cybersecurity Fundamentals",
			sessionName: "Evening",
		},
		{
			id: "7",
			courseName: "DevOps & Cloud Engineering",
			sessionName: "Morning",
		},
		{
			id: "8",
			courseName: "Machine Learning Basics",
			sessionName: "Afternoon",
		},
		{ id: "9", courseName: "Database Design & SQL", sessionName: "Evening" },
		{ id: "10", courseName: "Embedded Systems & IoT", sessionName: "Weekend" },
	];

	// Simulate fetching if needed in the future
	// useEffect(() => {
	//   setIsLoading(true);
	//   setError(null);
	//   // Replace with your actual API call
	//   const fetchOptions = async () => {
	//     try {
	//       // const response = await fetch('/api/course-classes');
	//       // const data = await response.json();
	//       // setOptions(data); // Assuming data matches CourseClassOption[]
	//       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
	//       // setOptions(mockOptions); // Set the options after simulated fetch
	//     } catch (err) {
	//       console.error("Failed to fetch class options:", err);
	//       setError("Failed to load classes.");
	//     } finally {
	//       setIsLoading(false);
	//     }
	//   };
	//   fetchOptions();
	// }, []); // Runs once on mount

	// Return the data in the expected object format
	return {
		options: mockOptions, // Use the hardcoded data for now
		isLoading: isLoading,
		// error: error, // Add if implementing error handling
	};
};

// Ensure you import this hook correctly in ScanPage.tsx
// import { useCourseClassOptions } from '@/features/classes/hooks/useCourseClassOptions'; // Adjust path as needed
