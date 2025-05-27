// data/mock-course-data.ts

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
		| "AI & ML"
		| "Business"
		| "Design"
		| "Marketing"
		| "Mathematics"
		| "Science"
		| "Language"
		| "Health & Fitness";
	image: string;
	iconUrl?: string;
	instructor: {
		name: string;
		title?: string;
		avatar?: string;
		bio?: string;
	};
	duration: string;
	level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
	tags?: string[];
	priceUSD: number;
	discountPriceUSD?: number;
	currencyCode?: "USD";
	isFeatured?: boolean;
	isPopular?: boolean;
	isNew?: boolean;
	studentsEnroled: number;
	rating?: number;
	reviewsCount?: number;
	learningOutcomes?: string[];
	prerequisites?: string[];
	modules?: {
		title: string;
		duration: string;
		lessons?: {
			title: string;
			duration: string;
			isPreview?: boolean;
		}[];
	}[];
	lastUpdated?: string;
	language?: string;
	certificate?: boolean;
	accessType?: "Lifetime" | "Limited";
	supportType?: "Instructor" | "Community" | "Both" | "None";
}

export const mockCourseData: Course[] = [
	// Web Development
	{
		id: "webdev-001",
		slug: "complete-web-development-bootcamp",
		title: "Complete Web Development Bootcamp 2025",
		subtitle:
			"From Zero to Hero: HTML, CSS, JavaScript, React, Node.js, MongoDB & More",
		description:
			"Become a full-stack web developer with this comprehensive course. You'll learn front-end and back-end technologies, databases, deployment, and best practices for building modern, responsive web applications. This bootcamp covers everything you need to start a career in web development.",
		category: "Web Development",
		image:
			"https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
		instructor: {
			name: "Dr. Angela Yu",
			title: "Senior Full-Stack Engineer & Educator",
			avatar:
				"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
			bio: "Dr. Angela Yu is a developer and lead instructor with over 10 years of experience in web development and teaching. She has helped over 1 million students learn to code and change their lives.",
		},
		duration: "65 hours (Self-paced)",
		level: "Beginner",
		tags: [
			"HTML",
			"CSS",
			"JavaScript",
			"React",
			"Node.js",
			"MongoDB",
			"Express",
			"Full-Stack",
		],
		priceUSD: 199.99,
		discountPriceUSD: 89.99,
		isFeatured: true,
		isPopular: true,
		studentsEnroled: 785000,
		rating: 4.8,
		reviewsCount: 152000,
		learningOutcomes: [
			"Build 16+ professional websites and web apps",
			"Master front-end development with HTML, CSS, JavaScript, and React",
			"Build back-end servers and APIs with Node.js",
			"Work with databases like MongoDB and SQL",
			"Implement authentication and security in your applications",
			"Deploy your applications to production with various hosting platforms",
		],
		prerequisites: [
			"Basic computer literacy",
			"No prior programming experience required",
		],
		modules: [
			{
				title: "Introduction to Web Development",
				duration: "3 hours",
				lessons: [
					{ title: "Course Overview", duration: "15 min", isPreview: true },
					{ title: "How the Internet Works", duration: "25 min" },
					{
						title: "Setting Up Your Development Environment",
						duration: "45 min",
					},
					{ title: "Introduction to HTML", duration: "1 hour 35 min" },
				],
			},
			{
				title: "HTML Fundamentals",
				duration: "5 hours",
				lessons: [
					{ title: "HTML Document Structure", duration: "45 min" },
					{ title: "HTML Elements and Attributes", duration: "1 hour" },
					{ title: "HTML Forms", duration: "1 hour 15 min" },
					{ title: "HTML5 Semantic Elements", duration: "1 hour" },
					{ title: "HTML Project: Personal Website", duration: "1 hour" },
				],
			},
			{
				title: "CSS Fundamentals",
				duration: "8 hours",
				lessons: [
					{ title: "Introduction to CSS", duration: "45 min" },
					{ title: "CSS Selectors", duration: "1 hour" },
					{ title: "CSS Box Model", duration: "1 hour 15 min" },
					{ title: "CSS Flexbox", duration: "1 hour 30 min" },
					{ title: "CSS Grid", duration: "1 hour 30 min" },
					{ title: "Responsive Design", duration: "1 hour" },
					{ title: "CSS Project: Portfolio Website", duration: "1 hour" },
				],
			},
		],
		lastUpdated: "2025-01-15",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "webdev-002",
		slug: "react-complete-guide",
		title: "React - The Complete Guide 2025",
		subtitle: "Master React with Hooks, Redux, Next.js, TypeScript & More",
		description:
			"Dive deep into React.js and build powerful, interactive web applications from scratch. This course covers all the fundamentals and advanced concepts of React, including the latest features and best practices. You'll learn through hands-on projects and real-world examples.",
		category: "Web Development",
		image:
			"https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Maximilian Schwarzmüller",
			title: "Professional Web Developer & Instructor",
			avatar:
				"https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
			bio: "Maximilian is a professional web developer and instructor with over 10 years of experience in the field. He has taught over 2 million students worldwide.",
		},
		duration: "48 hours (Self-paced)",
		level: "Intermediate",
		tags: ["React", "Hooks", "Redux", "Next.js", "TypeScript", "Frontend"],
		priceUSD: 149.99,
		discountPriceUSD: 79.99,
		isPopular: true,
		studentsEnroled: 520000,
		rating: 4.7,
		reviewsCount: 98000,
		learningOutcomes: [
			"Build powerful, fast, user-friendly, and reactive web apps",
			"Master React Hooks and functional components",
			"Manage application state with Redux and Context API",
			"Implement server-side rendering with Next.js",
			"Add static typing to your React apps with TypeScript",
			"Apply best practices and optimization techniques",
		],
		prerequisites: [
			"JavaScript fundamentals",
			"HTML & CSS basics",
			"ES6+ knowledge is a plus",
		],
		modules: [
			{
				title: "React Basics",
				duration: "6 hours",
				lessons: [
					{
						title: "Introduction to React",
						duration: "45 min",
						isPreview: true,
					},
					{
						title: "Setting Up the Development Environment",
						duration: "30 min",
					},
					{ title: "Components & JSX", duration: "1 hour 15 min" },
					{ title: "Props & State", duration: "1 hour 30 min" },
					{ title: "Handling Events", duration: "1 hour" },
					{ title: "Conditional Rendering", duration: "1 hour" },
				],
			},
			{
				title: "React Hooks",
				duration: "8 hours",
				lessons: [
					{ title: "Introduction to Hooks", duration: "45 min" },
					{ title: "useState Hook", duration: "1 hour 15 min" },
					{ title: "useEffect Hook", duration: "1 hour 30 min" },
					{ title: "useContext Hook", duration: "1 hour" },
					{ title: "useReducer Hook", duration: "1 hour 30 min" },
					{ title: "Custom Hooks", duration: "1 hour" },
					{ title: "Project: Task Manager App", duration: "1 hour" },
				],
			},
		],
		lastUpdated: "2025-02-10",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "webdev-003",
		slug: "javascript-complete-guide",
		title: "JavaScript - The Complete Guide 2025",
		subtitle: "Modern JavaScript from the Beginning - ES6 to Advanced Concepts",
		description:
			"Master JavaScript with this comprehensive course covering everything from the basics to advanced topics. You'll learn modern JavaScript features, asynchronous programming, DOM manipulation, and how to build real-world applications. Perfect for beginners and those looking to level up their JavaScript skills.",
		category: "Web Development",
		image:
			"https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Brad Traversy",
			title: "Full Stack Developer & Educator",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "40 hours (Self-paced)",
		level: "All Levels",
		tags: ["JavaScript", "ES6", "Async/Await", "DOM", "Web APIs"],
		priceUSD: 129.99,
		discountPriceUSD: 69.99,
		isPopular: true,
		studentsEnroled: 430000,
		rating: 4.8,
		reviewsCount: 85000,
		learningOutcomes: [
			"Master JavaScript fundamentals and advanced concepts",
			"Work with modern JavaScript features (ES6+)",
			"Understand asynchronous programming with Promises and Async/Await",
			"Manipulate the DOM and handle events",
			"Build real-world applications with JavaScript",
			"Implement object-oriented programming in JavaScript",
		],
		prerequisites: [
			"Basic HTML & CSS knowledge",
			"No prior JavaScript experience required",
		],
		lastUpdated: "2025-01-05",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},

	// Data Science
	{
		id: "ds-001",
		slug: "data-science-bootcamp",
		title: "Data Science Bootcamp: Python, SQL, Machine Learning & More",
		subtitle:
			"Complete Data Science Training: Mathematics, Statistics, Python, SQL, Machine Learning, NLP & More",
		description:
			"Become a data scientist with this comprehensive bootcamp. You'll learn Python programming, data manipulation, visualization, statistical analysis, machine learning, and more. This course covers all the skills you need to start a career in data science and analytics.",
		category: "Data Science",
		image:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Dr. Jose Portilla",
			title: "Head of Data Science at Pierian Training",
			avatar:
				"https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
			bio: "Dr. Jose Portilla has a BS and MS in Engineering from Santa Clara University and has been teaching data science and programming for over 5 years.",
		},
		duration: "60 hours (Self-paced)",
		level: "Beginner",
		tags: [
			"Python",
			"Pandas",
			"NumPy",
			"SQL",
			"Machine Learning",
			"Statistics",
		],
		priceUSD: 199.99,
		discountPriceUSD: 89.99,
		isFeatured: true,
		isPopular: true,
		studentsEnroled: 350000,
		rating: 4.9,
		reviewsCount: 75000,
		learningOutcomes: [
			"Master Python for data science and analysis",
			"Analyze data with Pandas, NumPy, and other libraries",
			"Create stunning visualizations with Matplotlib and Seaborn",
			"Implement machine learning algorithms with Scikit-Learn",
			"Work with databases using SQL",
			"Apply statistical analysis to real-world problems",
		],
		prerequisites: [
			"Basic computer literacy",
			"No prior programming experience required",
		],
		modules: [
			{
				title: "Python Fundamentals for Data Science",
				duration: "8 hours",
				lessons: [
					{
						title: "Introduction to Python",
						duration: "45 min",
						isPreview: true,
					},
					{ title: "Python Data Types", duration: "1 hour" },
					{ title: "Control Flow", duration: "1 hour 15 min" },
					{ title: "Functions and Methods", duration: "1 hour 30 min" },
					{ title: "Object-Oriented Programming", duration: "1 hour 30 min" },
					{ title: "Error Handling", duration: "1 hour" },
					{ title: "Python Project: Data Analysis Script", duration: "1 hour" },
				],
			},
			{
				title: "Data Manipulation with Pandas",
				duration: "10 hours",
				lessons: [
					{ title: "Introduction to Pandas", duration: "45 min" },
					{ title: "Series and DataFrames", duration: "1 hour 15 min" },
					{ title: "Data Cleaning", duration: "1 hour 30 min" },
					{ title: "Data Transformation", duration: "1 hour 30 min" },
					{ title: "Grouping and Aggregation", duration: "1 hour 30 min" },
					{ title: "Time Series Analysis", duration: "1 hour 30 min" },
					{ title: "Project: Exploratory Data Analysis", duration: "2 hours" },
				],
			},
		],
		lastUpdated: "2025-02-20",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "ds-002",
		slug: "machine-learning-a-z",
		title: "Machine Learning A-Z: Hands-On Python & R",
		subtitle:
			"Learn to create Machine Learning Algorithms in Python and R from scratch",
		description:
			"Learn to create Machine Learning Algorithms in Python and R from scratch. This course covers both the theory and practical implementation of machine learning algorithms, including regression, classification, clustering, and deep learning. You'll work on real-world projects and datasets to build your portfolio.",
		category: "Data Science",
		image:
			"https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
		instructor: {
			name: "Kirill Eremenko",
			title: "Data Scientist & Forex Systems Expert",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "44 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"Machine Learning",
			"Python",
			"R",
			"Regression",
			"Classification",
			"Clustering",
		],
		priceUSD: 169.99,
		discountPriceUSD: 84.99,
		isPopular: true,
		studentsEnroled: 820000,
		rating: 4.6,
		reviewsCount: 160000,
		learningOutcomes: [
			"Master machine learning on Python and R",
			"Implement regression algorithms for prediction",
			"Build classification models for decision making",
			"Create clustering algorithms for segmentation",
			"Apply dimensionality reduction techniques",
			"Develop reinforcement learning models",
		],
		prerequisites: [
			"Basic mathematics knowledge",
			"Basic programming experience is helpful but not required",
		],
		lastUpdated: "2025-01-25",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "ds-003",
		slug: "deep-learning-specialization",
		title: "Deep Learning Specialization",
		subtitle: "Master Deep Learning and Break into AI",
		description:
			"The Deep Learning Specialization is a foundational program that will help you understand the capabilities, challenges, and consequences of deep learning and prepare you to participate in the development of leading-edge AI technology. You'll learn the foundations of deep learning, how to build neural networks, and how to lead successful machine learning projects.",
		category: "Data Science",
		image:
			"https://images.unsplash.com/photo-1677442135136-760c813028c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Andrew Ng",
			title: "Founder of DeepLearning.AI & Co-founder of Coursera",
			avatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
			bio: "Andrew Ng is a globally recognized leader in AI. He founded and led the Google Brain team, served as Chief Scientist at Baidu, and co-founded Coursera.",
		},
		duration: "80 hours (Self-paced)",
		level: "Advanced",
		tags: [
			"Deep Learning",
			"Neural Networks",
			"TensorFlow",
			"Convolutional Networks",
			"RNN",
			"LSTM",
		],
		priceUSD: 249.99,
		discountPriceUSD: 129.99,
		isFeatured: true,
		studentsEnroled: 700000,
		rating: 4.9,
		reviewsCount: 140000,
		learningOutcomes: [
			"Build and train deep neural networks",
			"Implement vectorized neural networks",
			"Identify key architecture parameters",
			"Apply deep learning to computer vision and natural language processing",
			"Build convolutional neural networks and recurrent neural networks",
			"Implement optimization algorithms for neural networks",
		],
		prerequisites: [
			"Basic Python programming",
			"Basic linear algebra and calculus",
		],
		lastUpdated: "2025-03-01",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},

	// Mobile Development
	{
		id: "mob-001",
		slug: "ios-app-development-bootcamp",
		title: "iOS & Swift - The Complete iOS App Development Bootcamp",
		subtitle: "From Beginner to iOS App Developer with Just One Course",
		description:
			"Learn iOS app development by building real-world apps. This course covers Swift programming, UIKit, SwiftUI, Core Data, networking, and more. You'll build over 15 complete apps and gain the skills needed to become a professional iOS developer.",
		category: "Mobile Development",
		image:
			"https://images.unsplash.com/photo-1621839673705-6617adf9e890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
		instructor: {
			name: "Dr. Angela Yu",
			title: "Developer and Lead Instructor",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "55 hours (Self-paced)",
		level: "Beginner",
		tags: ["iOS", "Swift", "UIKit", "SwiftUI", "Xcode", "App Store"],
		priceUSD: 199.99,
		discountPriceUSD: 94.99,
		isPopular: true,
		studentsEnroled: 320000,
		rating: 4.8,
		reviewsCount: 65000,
		learningOutcomes: [
			"Master Swift programming language",
			"Build beautiful iOS apps with UIKit and SwiftUI",
			"Work with local and remote data using Core Data and networking",
			"Implement authentication and user accounts",
			"Publish your apps to the App Store",
			"Apply design patterns and best practices",
		],
		prerequisites: [
			"No programming experience required",
			"Mac computer with Xcode installed",
		],
		lastUpdated: "2025-02-15",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "mob-002",
		slug: "flutter-dart-complete",
		title: "Flutter & Dart - The Complete Guide [2025 Edition]",
		subtitle:
			"A Complete Guide to the Flutter SDK & Flutter Framework for Building Native iOS and Android Apps",
		description:
			"Build native iOS and Android apps with Flutter and Dart. This course covers everything from the basics to advanced topics, including state management, Firebase integration, animations, and more. You'll build real-world apps and learn best practices for Flutter development.",
		category: "Mobile Development",
		image:
			"https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Maximilian Schwarzmüller",
			title: "Professional Developer & Instructor",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "42 hours (Self-paced)",
		level: "Beginner",
		tags: [
			"Flutter",
			"Dart",
			"Mobile",
			"Firebase",
			"State Management",
			"Cross-Platform",
		],
		priceUSD: 179.99,
		discountPriceUSD: 89.99,
		isFeatured: true,
		isPopular: true,
		studentsEnroled: 280000,
		rating: 4.8,
		reviewsCount: 55000,
		learningOutcomes: [
			"Build beautiful, fast, and native mobile apps with Flutter",
			"Master Dart programming language",
			"Implement state management with Provider, Riverpod, and Bloc",
			"Integrate Firebase for authentication, database, and storage",
			"Create animations and custom UI components",
			"Deploy your apps to the App Store and Google Play",
		],
		prerequisites: ["Basic programming knowledge is helpful but not required"],
		modules: [
			{
				title: "Introduction to Flutter & Dart",
				duration: "6 hours",
				lessons: [
					{ title: "What is Flutter?", duration: "30 min", isPreview: true },
					{
						title: "Setting Up the Development Environment",
						duration: "45 min",
					},
					{ title: "Dart Basics", duration: "1 hour 15 min" },
					{ title: "Flutter Basics", duration: "1 hour 30 min" },
					{ title: "Building Your First Flutter App", duration: "2 hours" },
				],
			},
			{
				title: "Flutter Fundamentals",
				duration: "10 hours",
				lessons: [
					{ title: "Widgets, Widgets, Widgets", duration: "1 hour 30 min" },
					{ title: "Styling & Layouts", duration: "2 hours" },
					{ title: "Navigation & Multiple Screens", duration: "1 hour 30 min" },
					{ title: "State Management Basics", duration: "2 hours" },
					{ title: "User Input & Forms", duration: "1 hour 30 min" },
					{ title: "Project: Shopping App", duration: "1 hour 30 min" },
				],
			},
		],
		lastUpdated: "2025-03-10",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "mob-003",
		slug: "react-native-practical-guide",
		title: "React Native - The Practical Guide [2025]",
		subtitle: "Build native iOS and Android apps with JavaScript and React",
		description:
			"Learn React Native from the ground up and build iOS and Android apps with JavaScript and React. This course covers all the fundamentals and advanced concepts of React Native, including navigation, state management, native device features, and deployment. You'll build real-world apps and learn best practices for React Native development.",
		category: "Mobile Development",
		image:
			"https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Maximilian Schwarzmüller",
			title: "Professional Developer & Instructor",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "45 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"React Native",
			"JavaScript",
			"Mobile",
			"Cross-Platform",
			"Expo",
			"Redux",
		],
		priceUSD: 169.99,
		discountPriceUSD: 84.99,
		isPopular: true,
		studentsEnroled: 250000,
		rating: 4.7,
		reviewsCount: 48000,
		learningOutcomes: [
			"Build native mobile apps with JavaScript and React",
			"Implement navigation with React Navigation",
			"Manage state with Redux and Context API",
			"Access native device features like camera and location",
			"Style your apps with styled-components and CSS-in-JS",
			"Deploy your apps to the App Store and Google Play",
		],
		prerequisites: ["React.js knowledge", "JavaScript fundamentals"],
		lastUpdated: "2025-02-28",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},

	// Cybersecurity
	{
		id: "cs-001",
		slug: "complete-ethical-hacking-bootcamp",
		title: "Complete Ethical Hacking Bootcamp 2025",
		subtitle:
			"Learn Ethical Hacking, Penetration Testing, Network Security & More",
		description:
			"Master ethical hacking and penetration testing with this comprehensive bootcamp. You'll learn how to identify and exploit vulnerabilities, secure networks, perform web application testing, and more. This course covers all the tools and techniques used by professional ethical hackers and security experts.",
		category: "Cybersecurity",
		image:
			"https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Zaid Sabih",
			title: "Ethical Hacker & Cybersecurity Expert",
			avatar: "/placeholder.svg?height=100&width=100",
			bio: "Zaid is an ethical hacker, computer scientist, and the founder of zSecurity. He has trained over 500,000 students in cybersecurity and ethical hacking.",
		},
		duration: "50 hours (Self-paced)",
		level: "All Levels",
		tags: [
			"Ethical Hacking",
			"Penetration Testing",
			"Network Security",
			"Kali Linux",
			"Wireshark",
		],
		priceUSD: 189.99,
		discountPriceUSD: 94.99,
		isFeatured: true,
		studentsEnroled: 280000,
		rating: 4.7,
		reviewsCount: 55000,
		learningOutcomes: [
			"Perform penetration testing and vulnerability assessments",
			"Hack and secure networks, websites, and applications",
			"Master tools like Metasploit, Wireshark, and Burp Suite",
			"Understand and exploit common vulnerabilities",
			"Implement security measures to protect systems",
			"Prepare for cybersecurity certifications",
		],
		prerequisites: [
			"Basic IT knowledge",
			"No prior hacking experience required",
		],
		lastUpdated: "2025-03-05",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},
	{
		id: "cs-002",
		slug: "comptia-security-plus-certification",
		title: "CompTIA Security+ Certification (SY0-701)",
		subtitle: "Complete Course & Practice Exam",
		description:
			"Prepare for the CompTIA Security+ certification exam with this comprehensive course. You'll learn all the topics covered in the exam, including network security, threats and vulnerabilities, identity management, cryptography, and more. This course includes practice questions, hands-on labs, and exam tips to help you pass the exam on your first attempt.",
		category: "Cybersecurity",
		image:
			"https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Jason Dion",
			title: "Cybersecurity Expert & Certified Instructor",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "35 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"CompTIA",
			"Security+",
			"Certification",
			"Network Security",
			"Cryptography",
		],
		priceUSD: 149.99,
		discountPriceUSD: 74.99,
		isPopular: true,
		studentsEnroled: 220000,
		rating: 4.8,
		reviewsCount: 45000,
		learningOutcomes: [
			"Master all Security+ exam objectives",
			"Understand network security concepts and implementation",
			"Identify and mitigate security threats and vulnerabilities",
			"Implement identity and access management",
			"Apply cryptographic concepts and techniques",
			"Pass the CompTIA Security+ certification exam",
		],
		prerequisites: [
			"Basic IT knowledge",
			"Network+ certification or equivalent knowledge is recommended",
		],
		lastUpdated: "2025-01-20",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},

	// Cloud Computing
	{
		id: "cloud-001",
		slug: "aws-certified-solutions-architect",
		title: "AWS Certified Solutions Architect - Associate 2025",
		subtitle: "Complete Course & Practice Exam",
		description:
			"Prepare for the AWS Certified Solutions Architect - Associate exam with this comprehensive course. You'll learn how to design and deploy scalable, highly available, and fault-tolerant systems on AWS. This course covers all the services and concepts you need to know to pass the exam and become a certified AWS Solutions Architect.",
		category: "Cloud Computing",
		image:
			"https://images.unsplash.com/photo-1603695762547-fba8b92408c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
		instructor: {
			name: "Stephane Maarek",
			title: "AWS Certified Solutions Architect & Developer",
			avatar: "/placeholder.svg?height=100&width=100",
			bio: "Stephane is an AWS Certified Solutions Architect, Developer, and DevOps Engineer with years of experience in AWS. He has trained over 1 million students worldwide.",
		},
		duration: "30 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"AWS",
			"Cloud",
			"Certification",
			"Solutions Architect",
			"EC2",
			"S3",
			"RDS",
		],
		priceUSD: 149.99,
		discountPriceUSD: 74.99,
		isFeatured: true,
		isPopular: true,
		studentsEnroled: 450000,
		rating: 4.9,
		reviewsCount: 90000,
		learningOutcomes: [
			"Design and deploy scalable, highly available systems on AWS",
			"Implement cost-effective solutions",
			"Migrate applications to AWS",
			"Master core AWS services like EC2, S3, RDS, and more",
			"Implement security best practices",
			"Pass the AWS Certified Solutions Architect - Associate exam",
		],
		prerequisites: [
			"Basic IT knowledge",
			"Some cloud computing experience is helpful but not required",
		],
		modules: [
			{
				title: "Introduction to AWS",
				duration: "3 hours",
				lessons: [
					{ title: "AWS Fundamentals", duration: "45 min", isPreview: true },
					{ title: "AWS Global Infrastructure", duration: "30 min" },
					{ title: "Setting Up Your AWS Account", duration: "45 min" },
					{
						title: "AWS Identity and Access Management (IAM)",
						duration: "1 hour",
					},
				],
			},
			{
				title: "EC2 - Elastic Compute Cloud",
				duration: "5 hours",
				lessons: [
					{ title: "EC2 Basics", duration: "1 hour" },
					{ title: "EC2 Instance Types", duration: "45 min" },
					{ title: "Security Groups", duration: "45 min" },
					{ title: "EC2 User Data", duration: "30 min" },
					{ title: "EC2 Instance Storage", duration: "1 hour" },
					{ title: "EC2 Load Balancing", duration: "1 hour" },
				],
			},
		],
		lastUpdated: "2025-02-10",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},
	{
		id: "cloud-002",
		slug: "azure-administrator-associate",
		title: "Microsoft Azure Administrator (AZ-104)",
		subtitle: "Complete Course & Practice Exam",
		description:
			"Prepare for the Microsoft Azure Administrator (AZ-104) certification exam with this comprehensive course. You'll learn how to manage Azure subscriptions, secure identities, implement and manage storage, deploy and manage Azure compute resources, configure and manage virtual networking, and monitor your Azure resources. This course includes hands-on labs and practice exams to help you pass the certification.",
		category: "Cloud Computing",
		image:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
		instructor: {
			name: "Scott Duffy",
			title: "Microsoft Certified Trainer & Azure Architect",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "28 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"Azure",
			"Cloud",
			"Certification",
			"Administrator",
			"Virtual Machines",
			"Storage",
			"Networking",
		],
		priceUSD: 149.99,
		discountPriceUSD: 74.99,
		isPopular: true,
		studentsEnroled: 180000,
		rating: 4.7,
		reviewsCount: 35000,
		learningOutcomes: [
			"Manage Azure subscriptions and resources",
			"Implement and manage storage",
			"Deploy and manage Azure compute resources",
			"Configure and manage virtual networking",
			"Monitor and back up Azure resources",
			"Pass the Microsoft Azure Administrator (AZ-104) exam",
		],
		prerequisites: [
			"Basic IT knowledge",
			"Some cloud computing experience is helpful but not required",
		],
		lastUpdated: "2025-01-15",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},

	// AI & ML
	{
		id: "ai-001",
		slug: "ai-for-everyone",
		title: "AI For Everyone",
		subtitle: "Learn the Basics of AI Without the Technical Jargon",
		description:
			"This non-technical course will help you understand AI technologies, their applications, and how they can impact your organization. You'll learn what AI can and cannot do, how to spot opportunities to apply AI, and how to work with technical teams to implement AI solutions. Perfect for business professionals, managers, and executives who want to leverage AI in their organizations.",
		category: "AI & ML",
		image:
			"https://images.unsplash.com/photo-1677442135068-c5c9f36b5ac4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Andrew Ng",
			title: "Founder of DeepLearning.AI & Co-founder of Coursera",
			avatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
			bio: "Andrew Ng is a globally recognized leader in AI. He founded and led the Google Brain team, served as Chief Scientist at Baidu, and co-founded Coursera.",
		},
		duration: "4 hours (Self-paced)",
		level: "Beginner",
		tags: ["AI", "Machine Learning", "Business", "Strategy", "Non-Technical"],
		priceUSD: 49.99,
		discountPriceUSD: 29.99,
		isFeatured: true,
		studentsEnroled: 900000,
		rating: 4.9,
		reviewsCount: 180000,
		learningOutcomes: [
			"Understand what AI is and how it works",
			"Identify opportunities to apply AI in your organization",
			"Build a strategy for AI implementation",
			"Work effectively with technical teams on AI projects",
			"Understand the ethical and societal implications of AI",
			"Navigate the AI transformation in your industry",
		],
		prerequisites: ["No technical background required"],
		lastUpdated: "2025-01-05",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Community",
	},
	{
		id: "ai-002",
		slug: "practical-ai-with-python-and-pytorch",
		title: "Practical AI with Python and PyTorch",
		subtitle: "Build Real-World AI Applications with PyTorch",
		description:
			"Learn how to build practical AI applications using Python and PyTorch. This course covers the fundamentals of deep learning, computer vision, natural language processing, and reinforcement learning. You'll implement real-world projects like image classification, sentiment analysis, and game-playing agents. Perfect for developers who want to add AI capabilities to their applications.",
		category: "AI & ML",
		image:
			"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
		instructor: {
			name: "Daniel Bourke",
			title: "Machine Learning Engineer & Educator",
			avatar: "/placeholder.svg?height=100&width=100",
			bio: "Daniel is a self-taught machine learning engineer and educator. He has helped thousands of students learn AI and machine learning through his courses and YouTube channel.",
		},
		duration: "40 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"PyTorch",
			"Python",
			"Deep Learning",
			"Computer Vision",
			"NLP",
			"Reinforcement Learning",
		],
		priceUSD: 169.99,
		discountPriceUSD: 84.99,
		isPopular: true,
		studentsEnroled: 150000,
		rating: 4.8,
		reviewsCount: 30000,
		learningOutcomes: [
			"Build neural networks with PyTorch",
			"Implement computer vision applications",
			"Create natural language processing models",
			"Develop reinforcement learning agents",
			"Deploy AI models to production",
			"Apply best practices for AI development",
		],
		prerequisites: [
			"Python programming",
			"Basic understanding of machine learning concepts",
		],
		modules: [
			{
				title: "Introduction to PyTorch",
				duration: "5 hours",
				lessons: [
					{ title: "What is PyTorch?", duration: "30 min", isPreview: true },
					{ title: "Tensors and Operations", duration: "1 hour" },
					{ title: "Automatic Differentiation", duration: "1 hour" },
					{ title: "Neural Network Basics", duration: "1 hour 30 min" },
					{ title: "Building Your First Neural Network", duration: "1 hour" },
				],
			},
			{
				title: "Computer Vision with PyTorch",
				duration: "8 hours",
				lessons: [
					{ title: "Introduction to Computer Vision", duration: "45 min" },
					{ title: "Convolutional Neural Networks", duration: "1 hour 30 min" },
					{ title: "Image Classification", duration: "1 hour 30 min" },
					{ title: "Object Detection", duration: "1 hour 30 min" },
					{ title: "Image Segmentation", duration: "1 hour 30 min" },
					{
						title: "Project: Building an Image Classifier",
						duration: "1 hour 15 min",
					},
				],
			},
		],
		lastUpdated: "2025-02-25",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},

	// Business
	{
		id: "bus-001",
		slug: "mba-in-a-box",
		title: "MBA in a Box: Business Lessons from a CEO",
		subtitle:
			"Learn Business Strategy, Financial Analysis, Marketing, Leadership & More",
		description:
			"Get the essential knowledge of an MBA without the time and expense. This course covers business strategy, financial analysis, marketing, leadership, operations, and more. You'll learn from real-world case studies and practical examples to develop the skills needed for business success. Perfect for entrepreneurs, managers, and professionals looking to advance their careers.",
		category: "Business",
		image:
			"https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
		instructor: {
			name: "Chris Haroun",
			title: "Venture Capitalist & Business School Professor",
			avatar: "/placeholder.svg?height=100&width=100",
			bio: "Chris is a venture capitalist, business school professor, and former Goldman Sachs employee. He has invested in and advised over 50 companies and has taught at several business schools.",
		},
		duration: "50 hours (Self-paced)",
		level: "All Levels",
		tags: [
			"Business Strategy",
			"Finance",
			"Marketing",
			"Leadership",
			"Operations",
			"Entrepreneurship",
		],
		priceUSD: 199.99,
		discountPriceUSD: 99.99,
		isPopular: true,
		studentsEnroled: 600000,
		rating: 4.7,
		reviewsCount: 120000,
		learningOutcomes: [
			"Develop effective business strategies",
			"Analyze financial statements and make financial decisions",
			"Create marketing plans and branding strategies",
			"Lead teams and manage organizations",
			"Optimize operations and supply chains",
			"Start and grow a successful business",
		],
		prerequisites: ["No prior business knowledge required"],
		lastUpdated: "2025-01-10",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},

	// Design
	{
		id: "design-001",
		slug: "ui-ux-design-bootcamp",
		title: "UI/UX Design Bootcamp",
		subtitle: "Learn UI/UX Design from Scratch - Complete Design Process",
		description:
			"Master UI/UX design with this comprehensive bootcamp. You'll learn the entire design process, from user research and wireframing to prototyping and testing. This course covers design principles, tools like Figma and Adobe XD, and best practices for creating user-centered designs. Perfect for beginners and those looking to transition into a design career.",
		category: "Design",
		image:
			"https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
		instructor: {
			name: "Daniel Walter Scott",
			title: "UI/UX Designer & Adobe Certified Instructor",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "45 hours (Self-paced)",
		level: "Beginner",
		tags: [
			"UI Design",
			"UX Design",
			"Figma",
			"Adobe XD",
			"Wireframing",
			"Prototyping",
		],
		priceUSD: 179.99,
		discountPriceUSD: 89.99,
		isFeatured: true,
		studentsEnroled: 250000,
		rating: 4.8,
		reviewsCount: 50000,
		learningOutcomes: [
			"Master UI/UX design principles and methodologies",
			"Create wireframes, mockups, and prototypes",
			"Conduct user research and usability testing",
			"Design responsive interfaces for web and mobile",
			"Use industry-standard tools like Figma and Adobe XD",
			"Build a professional UI/UX design portfolio",
		],
		prerequisites: ["No design experience required", "Basic computer skills"],
		lastUpdated: "2025-02-20",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},

	// Marketing
	{
		id: "mkt-001",
		slug: "digital-marketing-bootcamp",
		title: "Complete Digital Marketing Bootcamp 2025",
		subtitle:
			"Master SEO, Social Media, Email Marketing, Google Ads, Facebook Ads & More",
		description:
			"Become a digital marketing expert with this comprehensive bootcamp. You'll learn SEO, social media marketing, email marketing, content marketing, Google Ads, Facebook Ads, analytics, and more. This course covers all the strategies and tools you need to create successful digital marketing campaigns and grow your business online.",
		category: "Marketing",
		image:
			"https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Phil Ebiner",
			title: "Digital Marketing Expert & Entrepreneur",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "55 hours (Self-paced)",
		level: "All Levels",
		tags: [
			"Digital Marketing",
			"SEO",
			"Social Media",
			"Email Marketing",
			"Google Ads",
			"Facebook Ads",
		],
		priceUSD: 189.99,
		discountPriceUSD: 94.99,
		isPopular: true,
		studentsEnroled: 350000,
		rating: 4.7,
		reviewsCount: 70000,
		learningOutcomes: [
			"Create comprehensive digital marketing strategies",
			"Optimize websites for search engines (SEO)",
			"Build effective social media marketing campaigns",
			"Implement email marketing and automation",
			"Run profitable Google Ads and Facebook Ads campaigns",
			"Analyze marketing performance with analytics tools",
		],
		prerequisites: [
			"No prior marketing experience required",
			"Basic computer skills",
		],
		lastUpdated: "2025-03-01",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},

	// Mathematics
	{
		id: "math-001",
		slug: "mathematics-for-machine-learning",
		title: "Mathematics for Machine Learning and Data Science",
		subtitle: "Master the Mathematical Foundations of Machine Learning",
		description:
			"Learn the essential mathematics for machine learning and data science. This course covers linear algebra, calculus, probability, and statistics, with a focus on their applications in machine learning algorithms. You'll gain a deep understanding of the mathematical concepts that underpin modern machine learning techniques.",
		category: "Mathematics",
		image:
			"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Dr. Tom Mitchell",
			title: "Professor of Computer Science & Mathematics",
			avatar: "/placeholder.svg?height=100&width=100",
			bio: "Dr. Mitchell is a professor of Computer Science and Mathematics with over 20 years of experience in machine learning research and education.",
		},
		duration: "40 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"Linear Algebra",
			"Calculus",
			"Probability",
			"Statistics",
			"Machine Learning",
		],
		priceUSD: 149.99,
		discountPriceUSD: 74.99,
		studentsEnroled: 180000,
		rating: 4.8,
		reviewsCount: 35000,
		learningOutcomes: [
			"Master linear algebra concepts for machine learning",
			"Apply calculus to optimization problems in ML",
			"Understand probability theory and its applications",
			"Use statistical methods for data analysis",
			"Implement mathematical concepts in Python",
			"Apply mathematical foundations to real ML problems",
		],
		prerequisites: [
			"Basic mathematics knowledge (high school level)",
			"Some programming experience is helpful",
		],
		lastUpdated: "2025-01-25",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},

	// Science
	{
		id: "sci-001",
		slug: "data-science-for-biologists",
		title: "Data Science for Biologists",
		subtitle: "Apply Data Science and Machine Learning to Biological Problems",
		description:
			"Learn how to apply data science and machine learning techniques to biological problems. This course covers data analysis, visualization, statistical modeling, and machine learning with a focus on biological applications. You'll work with real biological datasets and learn how to extract meaningful insights from complex biological data.",
		category: "Science",
		image:
			"https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Dr. Sarah Johnson",
			title: "Computational Biologist & Research Scientist",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "35 hours (Self-paced)",
		level: "Intermediate",
		tags: [
			"Data Science",
			"Biology",
			"Bioinformatics",
			"R Programming",
			"Python",
			"Machine Learning",
		],
		priceUSD: 159.99,
		discountPriceUSD: 79.99,
		studentsEnroled: 120000,
		rating: 4.8,
		reviewsCount: 25000,
		learningOutcomes: [
			"Analyze and visualize biological data",
			"Apply statistical methods to biological problems",
			"Implement machine learning for biological predictions",
			"Work with genomic, proteomic, and other biological datasets",
			"Use R and Python for biological data analysis",
			"Interpret and communicate results of biological data analysis",
		],
		prerequisites: [
			"Basic biology knowledge",
			"Some programming experience is helpful",
		],
		lastUpdated: "2025-02-15",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
	},

	// Language
	{
		id: "lang-001",
		slug: "spanish-for-beginners",
		title: "Spanish for Beginners: The Complete Course",
		subtitle:
			"Learn Spanish from Scratch - Grammar, Vocabulary, Conversation & More",
		description:
			"Learn Spanish from scratch with this comprehensive course. You'll master Spanish grammar, vocabulary, pronunciation, and conversation skills. This course includes interactive exercises, real-life dialogues, and cultural insights to help you become fluent in Spanish. Perfect for beginners and those looking to refresh their Spanish skills.",
		category: "Language",
		image:
			"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
		instructor: {
			name: "Maria Rodriguez",
			title: "Spanish Language Teacher & Native Speaker",
			avatar: "/placeholder.svg?height=100&width=100",
		},
		duration: "50 hours (Self-paced)",
		level: "Beginner",
		tags: [
			"Spanish",
			"Language Learning",
			"Grammar",
			"Vocabulary",
			"Conversation",
		],
		priceUSD: 129.99,
		discountPriceUSD: 64.99,
		studentsEnroled: 280000,
		rating: 4.8,
		reviewsCount: 55000,
		learningOutcomes: [
			"Master Spanish grammar and sentence structure",
			"Build a vocabulary of 2000+ Spanish words",
			"Develop Spanish conversation skills",
			"Understand Spanish pronunciation and accent",
			"Read and write in Spanish",
			"Gain insights into Spanish and Latin American culture",
		],
		prerequisites: ["No prior Spanish knowledge required"],
		lastUpdated: "2025-01-20",
		language: "English, Spanish",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",
	},

	// Health & Fitness
	{
		id: "health-001",
		slug: "complete-fitness-trainer-certification",
		title: "Complete Fitness Trainer Certification",
		subtitle:
			"Become a Certified Personal Trainer - Anatomy, Programming, Nutrition & More",
		description:
			"Become a certified personal trainer with this comprehensive course. You'll learn exercise science, anatomy, program design, nutrition, client assessment, and business skills. This course prepares you for major personal training certifications and gives you the knowledge and skills to start your career as a fitness professional.",
		category: "Health & Fitness",
		image:
			"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		instructor: {
			name: "Mark Williams",
			title: "Master Trainer & Exercise Physiologist",
			avatar: "/placeholder.svg?height=100&width=100",
			bio: "Mark is a certified master trainer and exercise physiologist with over 15 years of experience in the fitness industry. He has trained thousands of clients and hundreds of fitness professionals.",
		},
		duration: "60 hours (Self-paced)",
		level: "All Levels",
		tags: [
			"Personal Training",
			"Fitness",
			"Nutrition",
			"Anatomy",
			"Exercise Science",
			"Program Design",
		],
		priceUSD: 199.99,
		discountPriceUSD: 99.99,
		studentsEnroled: 200000,
		rating: 4.9,
		reviewsCount: 40000,
		learningOutcomes: [
			"Master exercise science and anatomy",
			"Design effective workout programs for clients",
			"Provide nutrition guidance and meal planning",
			"Conduct client assessments and goal setting",
			"Ensure safety and proper exercise technique",
			"Build and market your personal training business",
		],
		prerequisites: [
			"No prior fitness knowledge required",
			"Interest in fitness and helping others",
		],
		lastUpdated: "2025-02-28",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",
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

// Filter popular courses
export const popularCourses = mockCourseData.filter(
	(course) => course.isPopular
);

// Filter new courses
export const newCourses = mockCourseData.filter((course) => course.isNew);

// Get courses by category
export const getCoursesByCategory = (category: string) => {
	return mockCourseData.filter((course) => course.category === category);
};

// Get course by slug
export const getCourseBySlug = (slug: string) => {
	return mockCourseData.find((course) => course.slug === slug);
};

// Search courses
export const searchCourses = (query: string) => {
	const lowercaseQuery = query.toLowerCase();
	return mockCourseData.filter(
		(course) =>
			course.title.toLowerCase().includes(lowercaseQuery) ||
			course.description.toLowerCase().includes(lowercaseQuery) ||
			course.category.toLowerCase().includes(lowercaseQuery) ||
			course.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
	);
};

export const getMockCourses = async (): Promise<Course[]> => {
	console.log(
		"%c MOCK API: Fetching all courses ",
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 350 + Math.random() * 250)
	); // Simulate delay
	// Return a deep copy to prevent accidental mutation of original mock data
	return JSON.parse(JSON.stringify(mockCourseData));
};

// Simulate fetching a single course by slug
export const getMockCourseBySlug = async (
	slug: string
): Promise<Course | undefined> => {
	console.log(
		`%c MOCK API: Fetching course by slug: ${slug} `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 100 + Math.random() * 100)
	);
	const course = mockCourseData.find((course) => course.slug === slug);
	return course ? JSON.parse(JSON.stringify(course)) : undefined; // Return copy or undefined
};

// Simulate creating a Stripe checkout session (returns dummy data)
export const createMockCheckoutSession = async (payload: {
	courseId: string;
	userId: string;
}): Promise<{ sessionId: string }> => {
	console.log(
		`%c MOCK API: Creating checkout session for course ${payload.courseId} / user ${payload.userId} `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) => setTimeout(resolve, 500));
	return { sessionId: `cs_mock_${Date.now()}` }; // Return a fake session ID
};
