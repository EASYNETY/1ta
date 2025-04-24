// src/data/mock-course-data.ts

export interface Course {
	id: string;
	slug: string;
	title: string;
	subtitle?: string;
	description: string;
	category:
		| "Web Development"
		| "Data Science"
		| "Mobile Development"
		| "Cybersecurity"
		| "Cloud Computing"
		| "AI & ML";
	image: string;
	instructor: {
		name: string;
		title?: string;
		avatar?: string;
	};
	duration: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	tags?: string[];
	priceUSD: number;
	discountPriceUSD?: number;
	currencyCode?: "USD";
	isFeatured?: boolean;
	studentsEnrolled: number;
	rating?: number;
	reviewsCount?: number;
	learningOutcomes?: string[];
	prerequisites?: string[];
	modules?: { title: string; duration: string }[];
	lastUpdated?: string;
}

export const mockCourseData: Course[] = [
	// Web Development
	{
		id: "webdev-001",
		slug: "intro-web-development",
		title: "Comprehensive Web Development Bootcamp",
		subtitle: "From HTML/CSS/JS to Full-Stack MERN",
		description:
			"Become a job-ready web developer. Master front-end fundamentals, backend with Node.js & Express, databases, and React.",
		category: "Web Development",
		image:
			"https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop",
		instructor: {
			name: "Dr. Evelyn Reed",
			title: "Senior Full-Stack Engineer",
		},
		duration: "16 weeks (Full-time)",
		level: "Beginner",
		tags: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"],
		priceUSD: 499.99,
		discountPriceUSD: 399.99,
		isFeatured: true,
		studentsEnrolled: 185,
		rating: 4.8,
		reviewsCount: 102,
		learningOutcomes: [
			"Build responsive websites",
			"Develop RESTful APIs",
			"Manage databases",
			"Deploy full-stack applications",
		],
		prerequisites: ["Basic computer literacy"],
		lastUpdated: "2025-03-15",
	},
	{
		id: "webdev-002",
		slug: "react-deep-dive",
		title: "React - The Complete Guide (incl Hooks, Router, Redux)",
		description:
			"Dive deep into React.js and build powerful, interactive web applications from scratch.",
		category: "Web Development",
		image:
			"https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070&auto=format&fit=crop",
		instructor: { name: "Sarah Chen" },
		duration: "10 weeks",
		level: "Intermediate",
		tags: ["React", "Hooks", "Redux", "Router"],
		priceUSD: 129.99,
		studentsEnrolled: 250,
		rating: 4.7,
		reviewsCount: 155,
		learningOutcomes: [
			"Master React components & state",
			"Implement routing and state management",
			"Optimize React applications",
		],
		prerequisites: ["Solid JavaScript knowledge", "HTML/CSS basics"],
		lastUpdated: "2025-04-01",
	},

	// Data Science
	{
		id: "ds-001",
		slug: "data-science-foundations",
		title: "Data Science Foundations: Python & SQL",
		description:
			"Start your data science journey by mastering Python programming, data manipulation with Pandas, and SQL.",
		category: "Data Science",
		image:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
		instructor: { name: "Prof. Kenji Tanaka", title: "Lead Data Scientist" },
		duration: "10 weeks",
		level: "Beginner",
		tags: ["Python", "Pandas", "SQL", "Data Analysis"],
		priceUSD: 109.99,
		isFeatured: true,
		studentsEnrolled: 215,
		rating: 4.9,
		reviewsCount: 130,
		learningOutcomes: [
			"Write Python code for data analysis",
			"Manipulate dataframes with Pandas",
			"Query databases using SQL",
		],
		prerequisites: ["Basic programming concepts helpful but not required"],
		lastUpdated: "2025-03-01",
	},

	// Mobile Development
	{
		id: "mob-002",
		slug: "flutter-dart-complete",
		title: "Flutter & Dart - The Complete Guide [2025 Edition]",
		description:
			"Build native iOS and Android apps with Flutter and Dart. Includes null safety, state management, Firebase, and more.",
		category: "Mobile Development",
		image:
			"https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2069&auto=format&fit=crop",
		instructor: { name: "Maria Garcia" },
		duration: "15 weeks",
		level: "Beginner",
		tags: ["Flutter", "Dart", "Mobile", "Firebase"],
		priceUSD: 139.99,
		isFeatured: true,
		studentsEnrolled: 280,
		rating: 4.8,
		reviewsCount: 190,
		learningOutcomes: [
			"Develop apps with Flutter widgets",
			"Use Dart programming language",
			"Integrate with Firebase",
		],
		prerequisites: ["Basic programming concepts"],
		lastUpdated: "2025-03-25",
	},

	// Cybersecurity
	{
		id: "cs-001",
		slug: "cybersecurity-essentials",
		title: "Cybersecurity Essentials",
		description:
			"Understand core cybersecurity threats, vulnerabilities, and mitigation techniques in theory and practice.",
		category: "Cybersecurity",
		image:
			"https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop",
		instructor: { name: "Alex Thompson", title: "CISSP, Security Architect" },
		duration: "6 weeks",
		level: "Beginner",
		tags: ["Security", "Networking", "Threats", "Defense"],
		priceUSD: 99.99,
		studentsEnrolled: 155,
		rating: 4.7,
		reviewsCount: 95,
		learningOutcomes: [
			"Identify common cyber threats",
			"Understand basic security controls",
			"Apply security best practices",
		],
		prerequisites: ["Basic IT knowledge"],
		lastUpdated: "2025-01-30",
	},

	// Cloud Computing
	{
		id: "cloud-001",
		slug: "aws-certified-solutions-architect-associate",
		title: "AWS Certified Solutions Architect - Associate SAA-C03",
		description:
			"Pass the AWS Certified Solutions Architect Associate Exam with this comprehensive and hands-on course.",
		category: "Cloud Computing",
		image:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
		instructor: { name: "Stephane Maarek" },
		duration: "27 hours (Video)",
		level: "Intermediate",
		tags: ["AWS", "Cloud", "Certification", "SAA-C03"],
		priceUSD: 89.99,
		studentsEnrolled: 450,
		rating: 4.9,
		reviewsCount: 300,
		learningOutcomes: [
			"Design resilient AWS architectures",
			"Understand core AWS services",
			"Prepare for SAA-C03 exam",
		],
		prerequisites: ["Basic understanding of cloud concepts"],
		lastUpdated: "2025-04-08",
	},

	// AI & ML
	{
		id: "ai-001",
		slug: "ai-for-everyone",
		title: "AI For Everyone",
		description:
			"Master AI fundamentals without the jargon. Learn what AI can do, how it works, and how to leverage it.",
		category: "AI & ML",
		image:
			"https://images.unsplash.com/photo-1677442135136-760c813029fb?q=80&w=2070&auto=format&fit=crop",
		instructor: { name: "Andrew Ng" },
		duration: "4 weeks",
		level: "Beginner",
		tags: ["AI", "Machine Learning", "Business", "Strategy"],
		priceUSD: 49.99,
		studentsEnrolled: 500,
		rating: 4.9,
		reviewsCount: 350,
		learningOutcomes: [
			"Understand AI terminology",
			"Identify AI opportunities",
			"Grasp AI ethics and societal impact",
		],
		prerequisites: ["None"],
		lastUpdated: "2025-02-15",
	},
];

// Extract unique categories
export const courseCategories = Array.from(
	new Set(mockCourseData.map((course) => course.category))
);

// Filter featured courses
export const featuredCourses = mockCourseData.filter(
	(course) => course.isFeatured
);
