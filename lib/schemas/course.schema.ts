// src/lib/schemas/course.schema.ts
import { z } from "zod";

export const lessonSchema = z.object({
	title: z.string().min(1, "Lesson title is required").default(""),
	type: z.enum(["video", "quiz", "assignment", "text", "download"], {
		required_error: "Please select a lesson type.",
	}),
	duration: z.string().optional().default(""),
	description: z.string().optional().default(""),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

export const moduleSchema = z.object({
	title: z.string().min(1, "Module title is required").default(""),
	description: z.string().optional().default(""),
	lessons: z
		.array(lessonSchema)
		.min(1, "Each module must have at least one lesson.")
		.default([
			{
				title: "",
				type: "video",
				duration: "",
				description: "",
			},
		]),
});

export type ModuleFormValues = z.infer<typeof moduleSchema>;

export const courseSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters").default(""),
	subtitle: z.string().optional().default(""),
	description: z
		.string()
		.min(20, "Description must be at least 20 characters")
		.default(""),
	category: z
		.string({ required_error: "Please select a category." })
		.default(""),
	level: z
		.enum(["Beginner", "Intermediate", "Advanced", "All Levels"], {
			required_error: "Please select a level.",
		})
		.default("All Levels"),
	price: z.coerce
		.number()
		.min(0, "Price must be a positive number or zero.")
		.default(0),
	discountPrice: z
		.union([
			z.coerce.number().min(0, "Discount price must be positive or zero"),
			z.nan(),
			z.literal(""),
		])
		.optional()
		.transform((val) => (isNaN(val as number) || val === "" ? undefined : val))
		.refine((val) => val === undefined || val >= 0, {
			message: "Discount price must be positive or zero",
		}),
	language: z.string().default("English"),
	certificate: z.boolean().default(true),
	accessType: z.enum(["Lifetime", "Limited"]).default("Lifetime"),
	supportType: z
		.enum(["Instructor", "Community", "Both", "None"])
		.default("Both"),
	tags: z.string().optional().default(""),
	learningOutcomes: z.string().optional().default(""),
	prerequisites: z.string().optional().default(""),
	modules: z
		.array(moduleSchema)
		.min(1, "Course must have at least one module.")
		.default([
			{
				title: "",
				description: "",
				lessons: [
					{
						title: "",
						type: "video",
						duration: "",
						description: "",
					},
				],
			},
		]),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
