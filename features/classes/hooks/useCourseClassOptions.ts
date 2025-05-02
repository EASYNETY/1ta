export type CourseClassOption = {
	id: string;
	courseName: string;
	sessionName: string;
};

export const useCourseClassOptions = (): CourseClassOption[] => {
	return [
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
};
