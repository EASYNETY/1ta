import { User, isStudent } from "@/types/user.types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { PaymentRecord } from "@/features/payment/types/payment-types";
import {
	AttendanceRecord,
	AttendanceStatus,
} from "@/data/mock-attendance-data";
import { DashboardStats } from "../types/analytics-types";
import {
	subMonths,
	format,
	getDay,
	getYear,
	getMonth,
	parseISO,
	differenceInYears,
} from "date-fns";
import { CourseGrade } from "@/features/grades/types/grade-types";

/**
 * Derives comprehensive dashboard analytics from live data arrays.
 */
export function deriveDashboardStats(
	users: User[],
	courses: AuthCourse[],
	payments: PaymentRecord[],
	attendanceRecords: AttendanceRecord[],
	courseGrades: CourseGrade[]
): DashboardStats {
	const students = users.filter(isStudent);
	const now = new Date();

	// --- STUDENT STATS ---
	const newThisMonth = students.filter((s) => {
		const createdAt = s.createdAt ? parseISO(s.createdAt) : null;
		return (
			createdAt &&
			getMonth(createdAt) === getMonth(now) &&
			getYear(createdAt) === getYear(now)
		);
	}).length;

	const studentGrowth = Array.from({ length: 6 }).map((_, i) => {
		const targetMonth = subMonths(now, 5 - i);
		const count = students.filter((s) => {
			const createdAt = s.createdAt ? parseISO(s.createdAt) : null;
			return (
				createdAt &&
				getMonth(createdAt) === getMonth(targetMonth) &&
				getYear(createdAt) === getYear(targetMonth)
			);
		}).length;
		return { date: format(targetMonth, "MMM"), value: count };
	});

	// CORRECTED: Convert gender distribution object to an array for chart compatibility
	const genderDistribution = Object.entries(
		students.reduce(
			(acc, s) => {
				const gender = (s as any).gender?.toLowerCase() || "other";
				if (gender === "male") acc.Male++;
				else if (gender === "female") acc.Female++;
				else acc.Other++;
				return acc;
			},
			{ Male: 0, Female: 0, Other: 0 }
		)
	).map(([name, value]) => ({ name, value }));

	// CORRECTED: Convert age distribution object to an array for chart compatibility
	const ageDistribution = Object.entries(
		students.reduce(
			(acc, s) => {
				if (s.dateOfBirth) {
					const age = differenceInYears(now, parseISO(s.dateOfBirth));
					if (age < 18) acc["Under 18"]++;
					else if (age <= 24) acc["18-24"]++;
					else if (age <= 34) acc["25-34"]++;
					else if (age <= 44) acc["35-44"]++;
					else acc["45+"]++;
				}
				return acc;
			},
			{ "Under 18": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 } as Record<
				string,
				number
			>
		)
	).map(([name, value]) => ({ name, value }));

	// --- ENROLMENT & COURSE STATS ---
	const enrolledStudentIdsByCourse = new Map<string, Set<string>>();
	payments.forEach((p) => {
		if (p.status === "succeeded" && Array.isArray(p.relatedItemIds)) {
			const courseIds = p.relatedItemIds
				.filter((item) => item.type === "course")
				.map((item) => item.id);
			courseIds.forEach((courseId) => {
				if (!enrolledStudentIdsByCourse.has(courseId)) {
					enrolledStudentIdsByCourse.set(courseId, new Set());
				}
				enrolledStudentIdsByCourse.get(courseId)!.add(p.userId);
			});
		}
	});
	courseGrades.forEach((g) => {
		if (!enrolledStudentIdsByCourse.has(g.courseId)) {
			enrolledStudentIdsByCourse.set(g.courseId, new Set());
		}
		enrolledStudentIdsByCourse.get(g.courseId)!.add(g.studentId);
	});

	const totalCompletion = courses.reduce(
		(sum, course) => sum + (course.progress || 0),
		0
	);
	const coursesWithProgress = courses.filter((c) => c.progress !== undefined);
	const averageCompletion =
		coursesWithProgress.length > 0
			? Math.round(totalCompletion / coursesWithProgress.length)
			: 0;

	const enrolmentsByCourse = courses
		.map((c) => ({
			name: c.title,
			value: enrolledStudentIdsByCourse.get(c.id)?.size || 0,
		}))
		.sort((a, b) => b.value - a.value)
		.slice(0, 5);

	const completionRateByCourse = courses
		.map((c) => ({ name: c.title, value: c.progress || 0 }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 5);

	const averageGradeByCourse = courses
		.map((c) => {
			const gradesForCourse = courseGrades.filter((g) => g.courseId === c.id);
			if (gradesForCourse.length === 0) {
				return { name: c.title, value: 0 };
			}
			const totalGrade = gradesForCourse.reduce((sum, g) => sum + (g.gradeValue ?? 0), 0);
			const avgGrade = Math.round(totalGrade / gradesForCourse.length);
			return { name: c.title, value: avgGrade };
		})
		.sort((a, b) => b.value - a.value)
		.slice(0, 5);

	// --- PAYMENT STATS ---
	const totalRevenue = payments.reduce(
		(sum, p) => sum + (p.status === "succeeded" ? p.amount : 0),
		0
	);
	const revenueThisMonth = payments
		.filter((p) => {
			const createdAt = p.createdAt ? parseISO(p.createdAt) : null;
			return (
				p.status === "succeeded" &&
				createdAt &&
				getMonth(createdAt) === getMonth(now) &&
				getYear(createdAt) === getYear(now)
			);
		})
		.reduce((sum, p) => sum + p.amount, 0);

	const revenueTrends = Array.from({ length: 6 }).map((_, i) => {
		const targetMonth = subMonths(now, 5 - i);
		const revenue = payments
			.filter((p) => {
				const createdAt = p.createdAt ? parseISO(p.createdAt) : null;
				return (
					p.status === "succeeded" &&
					createdAt &&
					getMonth(createdAt) === getMonth(targetMonth) &&
					getYear(createdAt) === getYear(targetMonth)
				);
			})
			.reduce((sum, p) => sum + p.amount, 0);
		return { date: format(targetMonth, "MMM"), value: revenue };
	});

	const paymentMethodDistribution = Object.entries(
		payments.reduce(
			(acc, p) => {
				const method = p.provider || "Unknown";
				acc[method] = (acc[method] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	).map(([name, value]) => ({ name, value }));

	const paymentStatusDistribution = Object.entries(
		payments.reduce(
			(acc, p) => {
				const status = p.status || "unknown";
				acc[status] = (acc[status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	).map(([name, value]) => ({ name, value }));

	const revenueByCourse = courses
		.map((c) => {
			const coursePayments = payments.filter(
				(p) => Array.isArray(p.relatedItemIds) && p.relatedItemIds.some(item => item.type === "course" && item.id === c.id) && p.status === "succeeded"
			);
			const revenue = coursePayments.reduce((sum, p) => sum + p.amount, 0);
			return { name: c.title, value: revenue };
		})
		.sort((a, b) => b.value - a.value)
		.slice(0, 5);

	// --- ATTENDANCE STATS ---
	const presentCount = attendanceRecords.filter(
		(r) => r.status === "present" || r.status === "late"
	).length;
	const averageRate =
		attendanceRecords.length > 0
			? Math.round((presentCount / attendanceRecords.length) * 100)
			: 0;

	const rateTrends = Array.from({ length: 6 }).map((_, i) => {
		const targetMonth = subMonths(now, 5 - i);
		const recordsInMonth = attendanceRecords.filter((r) => {
			const recordDate = parseISO(r.date);
			return (
				getMonth(recordDate) === getMonth(targetMonth) &&
				getYear(recordDate) === getYear(targetMonth)
			);
		});
		const presentInMonth = recordsInMonth.filter(
			(r) => r.status === "present" || r.status === "late"
		).length;
		const rate =
			recordsInMonth.length > 0
				? Math.round((presentInMonth / recordsInMonth.length) * 100)
				: 0;
		return { date: format(targetMonth, "MMM"), value: rate };
	});

	const byDayOfWeekData = attendanceRecords.reduce(
		(acc, r) => {
			const dayIndex = getDay(parseISO(r.date));
			const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
				dayIndex
			];
			acc[dayName] = acc[dayName] || { total: 0, present: 0 };
			acc[dayName].total++;
			if (r.status === "present" || r.status === "late") acc[dayName].present++;
			return acc;
		},
		{} as Record<string, { total: number; present: number }>
	);

	const byDayOfWeekChartData = Object.entries(byDayOfWeekData).map(
		([name, data]) => ({
			name,
			value: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
		})
	);

	const statusDistribution = Object.entries(
		attendanceRecords.reduce(
			(acc, r) => {
				acc[r.status] = (acc[r.status] || 0) + 1;
				return acc;
			},
			{} as Record<AttendanceStatus, number>
		)
	).map(([name, value]) => ({ name, value }));

	const byCourse = courses
		.map((c) => {
			const courseRecords = attendanceRecords.filter((r) => r.classId === c.id);
			const presentRecords = courseRecords.filter(
				(r) => r.status === "present" || r.status === "late"
			).length;
			const rate =
				courseRecords.length > 0
					? Math.round((presentRecords / courseRecords.length) * 100)
					: 0;
			return { name: c.title, value: rate };
		})
		.sort((a, b) => b.value - a.value)
		.slice(0, 5);

	// --- FINAL ASSEMBLY ---
	return {
		studentStats: {
			total: students.length,
			newThisMonth,
			growth: studentGrowth,
			genderDistribution,
			ageDistribution,
		},
		courseStats: {
			total: courses.length,
			averageCompletion,
			enrolmentsByCourse,
			completionRateByCourse,
			averageGradeByCourse,
		},
		paymentStats: {
			totalRevenue,
			revenueThisMonth,
			revenueTrends,
			paymentMethodDistribution,
			paymentStatusDistribution,
			revenueByCourse,
		},
		attendanceStats: {
			averageRate,
			rateTrends,
			byDayOfWeek: byDayOfWeekChartData,
			statusDistribution,
			byCourse,
		},
	};
}

// New function to derive course revenue and enrollment data similar to accounting utils
export function deriveCourseRevenueAndEnrollment(
	courses: AuthCourse[],
	payments: PaymentRecord[]
) {
	const enrolledStudentIdsByCourse = new Map<string, Set<string>>();
	const revenueByCourse = new Map<string, number>();

	payments.forEach((p) => {
		if (p.status === "succeeded" && Array.isArray(p.relatedItemIds)) {
			const courseIds = p.relatedItemIds
				.filter((item) => item.type === "course")
				.map((item) => item.id);
			courseIds.forEach((courseId) => {
				if (!enrolledStudentIdsByCourse.has(courseId)) {
					enrolledStudentIdsByCourse.set(courseId, new Set());
				}
				enrolledStudentIdsByCourse.get(courseId)!.add(p.userId);

				const currentRevenue = revenueByCourse.get(courseId) || 0;
				revenueByCourse.set(courseId, currentRevenue + p.amount);
			});
		}
	});

	const courseRevenues = courses.map((course) => {
		const enrolledStudents = enrolledStudentIdsByCourse.get(course.id)?.size || 0;
		const totalRevenue = revenueByCourse.get(course.id) || 0;
		return {
			courseId: course.id,
			courseName: course.title,
			enrolledStudents,
			totalRevenue,
			completionRate: course.progress || 0,
			revenueChangePercentage: 0, // Placeholder for future calculation
		};
	});

	return courseRevenues;
}

// New function to derive attendance reports per course from attendance records
export function deriveAttendanceReportsPerCourse(
	courses: AuthCourse[],
	attendanceRecords: AttendanceRecord[]
) {
	const reports = courses.map((course) => {
		const courseRecords = attendanceRecords.filter(
			(r) => r.classId === course.id
		);
		const presentCount = courseRecords.filter(
			(r) => r.status === "present" || r.status === "late"
		).length;
		const absentCount = courseRecords.filter((r) => r.status === "absent").length;
		const lateCount = courseRecords.filter((r) => r.status === "late").length;
		const totalStudents = courseRecords.length;
		const attendanceRate =
			totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

		return {
			courseId: course.id,
			courseName: course.title,
			presentCount,
			absentCount,
			lateCount,
			attendanceRate,
		};
	});

	return reports;
}
