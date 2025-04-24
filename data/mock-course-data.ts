// src/data/mock-course-data.ts (New File)

export interface Course {
	id: string; // Use string IDs usually
	slug: string; // For URL routing
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
		avatar?: string; // Optional avatar URL
	};
	duration: string; // e.g., "8 weeks", "120 hours"
	level: "Beginner" | "Intermediate" | "Advanced";
	tags?: string[]; // e.g., ["React", "Node.js", "JavaScript"]
	priceUSD: number;
	discountPriceUSD?: number; // Optional discount price
	currencyCode?: "USD"; // Base currency
	isFeatured?: boolean; // Flag for featured courses
	studentsEnrolled: number;
	rating?: number; // Average rating (e.g., 4.5)
	reviewsCount?: number; // Number of reviews
	learningOutcomes?: string[];
	prerequisites?: string[];
	modules?: { title: string; duration: string }[]; // Simplified modules
	lastUpdated?: string; // e.g., "2025-04-10"
}

export const mockCourseData: Course[] = [
	// --- Web Development ---
	{
		id: "webdev-001",
		slug: "intro-web-development",
		title: "Comprehensive Web Development Bootcamp",
		subtitle: "From HTML/CSS/JS to Full-Stack MERN",
		description:
			"Become a job-ready web developer. Master front-end fundamentals, backend with Node.js & Express, databases, and React.",
		category: "Web Development",
		image: "/images/courses/webdev-bootcamp.jpg",
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
		image: "/images/courses/react-guide.jpg",
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
	{
		id: "webdev-003",
		slug: "nodejs-backend-masterclass",
		title: "Node.js Backend Masterclass",
		description:
			"Build scalable and performant backend APIs using Node.js, Express, and MongoDB.",
		category: "Web Development",
		image: "/images/courses/node-masterclass.jpg",
		instructor: { name: "Dr. Evelyn Reed" },
		duration: "8 weeks",
		level: "Intermediate",
		tags: ["Node.js", "Express", "API", "MongoDB", "Backend"],
		priceUSD: 119.99,
		studentsEnrolled: 140,
		rating: 4.6,
		reviewsCount: 88,
		learningOutcomes: [
			"Build RESTful APIs",
			"Handle authentication & authorization",
			"Interact with databases effectively",
		],
		prerequisites: ["JavaScript basics"],
		lastUpdated: "2025-02-20",
	},

	// --- Data Science ---
	{
		id: "ds-001",
		slug: "data-science-foundations",
		title: "Data Science Foundations: Python & SQL",
		description:
			"Start your data science journey by mastering Python programming, data manipulation with Pandas, and SQL.",
		category: "Data Science",
		image: "/images/courses/ds-foundations.jpg",
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
	{
		id: "ds-002",
		slug: "machine-learning-az",
		title: "Machine Learning A-Z™: Hands-On Python & R In Data Science",
		description:
			"Learn to create Machine Learning algorithms in Python and R from two Data Science experts. Code templates included.",
		category: "Data Science",
		image: "/images/courses/ml-az.jpg",
		instructor: { name: "Dr. Anya Sharma" },
		duration: "14 weeks",
		level: "Intermediate",
		tags: ["Machine Learning", "Python", "R", "Statistics"],
		priceUSD: 199.99,
		discountPriceUSD: 179.99,
		studentsEnrolled: 305,
		rating: 4.7,
		reviewsCount: 210,
		learningOutcomes: [
			"Implement various ML models",
			"Understand core ML concepts",
			"Perform feature engineering",
		],
		prerequisites: ["Python or R basics", "High school mathematics"],
		lastUpdated: "2025-04-05",
	},

	// --- Mobile Development ---
	{
		id: "mob-001",
		slug: "react-native-complete",
		title: "React Native - The Practical Guide [2025]",
		description:
			"Use React Native to build native iOS and Android Apps - incl. Hooks, Redux, Context API, Auth, Push Notifications.",
		category: "Mobile Development",
		image: "/images/courses/rn-guide.jpg",
		instructor: { name: "David Lee" },
		duration: "12 weeks",
		level: "Intermediate",
		tags: ["React Native", "Mobile", "iOS", "Android", "JavaScript"],
		priceUSD: 149.99,
		studentsEnrolled: 190,
		rating: 4.6,
		reviewsCount: 115,
		learningOutcomes: [
			"Build cross-platform apps",
			"Manage state in mobile apps",
			"Utilize native device features",
		],
		prerequisites: ["React basics", "JavaScript knowledge"],
		lastUpdated: "2025-02-10",
	},
	{
		id: "mob-002",
		slug: "flutter-dart-complete",
		title: "Flutter & Dart - The Complete Guide [2025 Edition]",
		description:
			"Build native iOS and Android apps with Flutter and Dart. Includes null safety, state management, Firebase, and more.",
		category: "Mobile Development",
		image: "/images/courses/flutter-guide.jpg",
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

	// --- Cybersecurity ---
	{
		id: "cs-001",
		slug: "cybersecurity-essentials",
		title: "Cybersecurity Essentials",
		description:
			"Understand core cybersecurity threats, vulnerabilities, and mitigation techniques in theory and practice.",
		category: "Cybersecurity",
		image: "/images/courses/cyber-essentials.jpg",
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

	// --- Cloud Computing ---
	{
		id: "cloud-001",
		slug: "aws-certified-solutions-architect-associate",
		title: "AWS Certified Solutions Architect - Associate SAA-C03",
		description:
			"Pass the AWS Certified Solutions Architect Associate Exam with this comprehensive and hands-on course.",
		category: "Cloud Computing",
		image: "/images/courses/aws-saa.jpg",
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

	// --- AI & ML ---
	{
		id: "ai-001",
		slug: "ai-for-everyone",
		title: "AI For Everyone",
		description:
			"Master AI fundamentals without the jargon. Learn what AI can do, how it works, and how to leverage it.",
		category: "AI & ML",
		image: "/images/courses/ai-everyone.jpg",
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
