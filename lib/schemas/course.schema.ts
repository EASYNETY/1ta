// src/lib/schemas/course.schema.ts
import { z } from "zod";

export const lessonSchema = z.object({
	title: z.string().min(1, "Lesson title is required"),
	type: z.enum(["video", "quiz", "assignment", "text", "download"], {
		required_error: "Please select a lesson type.",
	}),
	duration: z.string().optional(),
	description: z.string().optional(),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

export const moduleSchema = z.object({
	title: z.string().min(1, "Module title is required"),
	description: z.string().optional(),
	lessons: z
		.array(lessonSchema)
		.min(1, "Each module must have at least one lesson."),
});

export type ModuleFormValues = z.infer<typeof moduleSchema>;

export const courseSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters"),
	subtitle: z.string().optional(),
	description: z.string().min(20, "Description must be at least 20 characters"),
	category: z.string({ required_error: "Please select a category." }),
	level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"], {
		required_error: "Please select a level.",
	}),
	// Media fields
	image: z.string().optional().nullable(),
	previewVideoUrl: z.string().optional().nullable(),
	// Enrolment availability
	available_for_enrolment: z.boolean().optional().default(true),
	// USD Pricing
	price: z.coerce.number().min(0, "Price must be a positive number or zero."),
	discountPrice: z
		.union([
			z.coerce.number().min(0, "Discount price must be positive or zero"),
			z.nan(),
			z.literal(""),
		])
		.optional()
		.transform((val) => {
			// Handle empty string, NaN, or undefined cases
			if (
				val === "" ||
				val === undefined ||
				(typeof val === "number" && isNaN(val))
			) {
				return undefined;
			}
			// Ensure we return a number
			return typeof val === "number" ? val : Number(val);
		})
		.refine(
			(val) => val === undefined || (typeof val === "number" && val >= 0),
			{
				message: "Discount price must be positive or zero",
			}
		),
	// Naira Pricing
	priceNaira: z.coerce
		.number()
		.min(0, "Price must be a positive number or zero.")
		.optional(),
	discountPriceNaira: z
		.union([
			z.coerce.number().min(0, "Discount price must be positive or zero"),
			z.nan(),
			z.literal(""),
		])
		.optional()
		.transform((val) => {
			// Handle empty string, NaN, or undefined cases
			if (
				val === "" ||
				val === undefined ||
				(typeof val === "number" && isNaN(val))
			) {
				return undefined;
			}
			// Ensure we return a number
			return typeof val === "number" ? val : Number(val);
		})
		.refine(
			(val) => val === undefined || (typeof val === "number" && val >= 0),
			{
				message: "Discount price must be positive or zero",
			}
		),
	language: z.string(),
	certificate: z.boolean(),
	accessType: z.enum(["Lifetime", "Limited"]),
	supportType: z.enum(["Instructor", "Community", "Both", "None"]),
	tags: z.string().optional(),
	learningOutcomes: z.string().optional(),
	prerequisites: z.string().optional(),
	modules: z.array(moduleSchema),
	// .min(1, "Course must have at least one module."),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

// Extended type for form default values
export const defaultCourseValues: Partial<CourseFormValues> = {
	title: "",
	subtitle: "",
	description: "",
	category: "",
	level: "All Levels",
	price: 0,
	priceNaira: 0,
	discountPrice: undefined,
	discountPriceNaira: undefined,
	available_for_enrolment: true,
	language: "English",
	certificate: true,
	accessType: "Lifetime",
	supportType: "Both",
	tags: "",
	learningOutcomes: "",
	prerequisites: "",
	modules: [
		{
			title: "Module 1",
			description: "",
			lessons: [
				{
					title: "Lesson 1",
					type: "video",
					duration: "",
					description: "",
				},
			],
		},
	],
};
