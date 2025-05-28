// features/classes/store/classes-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type {
	AdminClassView,
	ClassOptionsResponse,
	CourseClassOption,
} from "../types/classes-types";
import { get, post, put, del } from "@/lib/api-client";

const isClassActive = (value: any): boolean => {
	if (value === undefined || value === null) {
		return false;
	}
	if (typeof value === 'number') {
		return value === 1;
	}
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'string') {
		const normalizedValue = value.toLowerCase();
		return normalizedValue === '1' ||
			normalizedValue === 'true' ||
			normalizedValue === 'active' ||
			normalizedValue === 'yes';
	}
	if (typeof value === 'object') {
		if ('status' in value) {
			const status = value.status;
			return status === 'active' || status === true || status === 1;
		}
	}
	return false;
};

export type CreateClassPayload = Omit<
	AdminClassView,
	"id" | "studentCount" | "teacherName"
> & { teacherId?: string };
export type UpdateClassPayload = Partial<
	Omit<AdminClassView, "id" | "studentCount" | "teacherName">
> & { id: string; teacherId?: string };

export const fetchMyEnroledClasses = createAsyncThunk<
	AuthCourse[],
	string,
	{ rejectValue: string }
>("classes/fetchMyEnroled", async (userId, { rejectWithValue }) => {
	try {
		const response = await get<any>(`/users/${userId}/enroled-classes`);
		console.log("fetchMyEnroledClasses: API response:", response);
		if (!response) {
			console.error("fetchMyEnroledClasses: API response is null or undefined");
			return [];
		}
		if (response.success && Array.isArray(response.data)) {
			if (!response.data) {
				console.error("fetchMyEnroledClasses: response.data is null or undefined");
				return [];
			}
			return response.data.map((item: any) => ({
				id: item.id,
				slug: item.courseSlug || '',
				title: item.title || item.courseTitle,
				description: item.description || '',
				category: item.type || 'course',
				image: '/placeholder.svg',
				instructor: { name: item.instructor || 'Instructor' },
				level: 'All Levels',
				priceUSD: 0,
			}));
		}
		if (Array.isArray(response)) {
			return response.map((item: any) => ({
				id: item.id,
				slug: item.courseSlug || '',
				title: item.title || item.courseTitle,
				description: item.description || '',
				category: item.type || 'course',
				image: '/placeholder.svg',
				instructor: { name: item.instructor || 'Instructor' },
				level: 'All Levels',
				priceUSD: 0,
			}));
		}
		return response || [];
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch enroled classes";
		console.error("fetchMyEnroledClasses: Error:", errorMessage);
		return rejectWithValue(errorMessage);
	}
});

export const fetchMyTaughtClasses = createAsyncThunk<
	AuthCourse[],
	string,
	{ rejectValue: string }
>("classes/fetchMyTaught", async (teacherId, { rejectWithValue }) => {
	try {
		const response = await get<any>(`/teachers/${teacherId}/taught-classes`);
		console.log("fetchMyTaughtClasses: API response:", response);
		if (!response) {
			console.error("fetchMyTaughtClasses: API response is null or undefined");
			return [];
		}
		if (response.success && Array.isArray(response.data)) {
			if (!response.data) {
				console.error("fetchMyTaughtClasses: response.data is null or undefined");
				return [];
			}
			return response.data.map((item: any) => ({
				id: item.id,
				slug: item.courseSlug || '',
				title: item.title || item.courseTitle,
				description: item.description || '',
				category: item.type || 'course',
				image: '/placeholder.svg',
				instructor: { name: item.instructor || 'Instructor' },
				level: 'All Levels',
				priceUSD: 0,
			}));
		}
		if (Array.isArray(response)) {
			return response.map((item: any) => ({
				id: item.id,
				slug: item.courseSlug || '',
				title: item.title || item.courseTitle,
				description: item.description || '',
				category: item.type || 'course',
				image: '/placeholder.svg',
				instructor: { name: item.instructor || 'Instructor' },
				level: 'All Levels',
				priceUSD: 0,
			}));
		}
		return response || [];
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch taught classes";
		console.error("fetchMyTaughtClasses: Error:", errorMessage);
		return rejectWithValue(errorMessage);
	}
});

export interface FetchAdminParams {
	page?: number;
	limit?: number;
	search?: string;
}
export interface FetchAdminClassesResult {
	classes: AdminClassView[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const fetchAllClassesAdmin = createAsyncThunk<
	FetchAdminClassesResult,
	FetchAdminParams,
	{ rejectValue: string }
>("classes/fetchAllAdmin", async ({ page = 1, limit = 10, search }, { rejectWithValue }) => {
	try {
		const queryParams = new URLSearchParams();
		queryParams.append("page", String(page));
		queryParams.append("limit", String(limit));
		if (search) {
			queryParams.append("search", search);
		}
		const endpointWithPath = `/admin/classes?${queryParams.toString()}`;
		const response = await get<any>(endpointWithPath);
		let classesData: any[] = [];
		if (Array.isArray(response)) {
			classesData = response;
		} else if (response && response.success === true && Array.isArray(response.data)) {
			classesData = response.data;
		} else if (response && response.data) {
			if (Array.isArray(response.data)) {
				classesData = response.data;
			} else if (typeof response.data === 'object') {
				classesData = Object.values(response.data);
			}
		} else if (response && response.data && Array.isArray(response.data.classes)) {
			classesData = response.data.classes;
		} else if (response && response.classes && Array.isArray(response.classes)) {
			classesData = response.classes;
		} else if (response && typeof response === 'object' && response.pagination) {
			classesData = Object.entries(response)
				.filter(([key]) => key !== 'pagination' && !isNaN(Number(key)))
				.map(([_, value]) => value);
		} else if (response && typeof response === 'object') {
			if (response.id && (response.name || response.title)) {
				classesData = [response];
			} else {
				const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
				if (possibleArrays.length > 0) {
					classesData = possibleArrays[0];
				} else {
					const objectValues = Object.entries(response)
						.filter(([key]) => !isNaN(Number(key)))
						.map(([_, value]) => value);
					if (objectValues.length > 0) {
						classesData = objectValues;
					}
				}
			}
		}
		console.log("fetchAllClassesAdmin: Extracted classes data length:", classesData.length);
		if (classesData.length > 0) {
			console.log("fetchAllClassesAdmin: First class sample:", classesData[0]);
		}
		const mappedClasses = classesData.map((cls: any) => {
			const mappedClass: AdminClassView = {
				id: cls.id,
				name: cls.name || "",
				courseTitle: cls.name || cls.title || "",
				courseId: cls.courseId || cls.course_id || "",
				course_id: cls.courseId || cls.course_id || "",
				teacherName: cls.teacherName || cls.teacher_name || (cls.teacher ? cls.teacher.name : "N/A"),
				teacherId: cls.teacherId || cls.teacher_id || null,
				teacher_id: cls.teacherId || cls.teacher_id || null,
				teacher: cls.teacher,
				studentCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
				max_students: cls.maxStudents || cls.max_students || 30,
				maxStudents: cls.maxStudents || cls.max_students || 30,
				max_slots: cls.maxSlots || cls.max_slots,
				maxSlots: cls.maxSlots || cls.max_slots,
				available_slots: cls.availableSlots || cls.available_slots,
				availableSlots: cls.availableSlots || cls.available_slots,
				enroled_students_count: cls.enroledStudentsCount || cls.enroled_students_count || 0,
				enroledStudentsCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
				status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
				isActive: cls.isActive,
				startDate: cls.startDate || cls.start_date || "",
				start_date: cls.startDate || cls.start_date || "",
				endDate: cls.endDate || cls.end_date || "",
				end_date: cls.endDate || cls.end_date || "",
				description: cls.description || "",
				schedule: cls.schedule || { days: [], time: "", duration: "" },
				location: cls.location || "",
				course: cls.course,
				metadata: cls.metadata,
				createdAt: cls.createdAt || cls.created_at,
				created_at: cls.createdAt || cls.created_at,
				updatedAt: cls.updatedAt || cls.updated_at,
				updated_at: cls.updatedAt || cls.updated_at,
			};
			return mappedClass;
		});
		const pagination = response.pagination || {
			total: mappedClasses.length,
			page: page,
			limit: limit,
			pages: Math.ceil(mappedClasses.length / limit)
		};
		return {
			classes: mappedClasses,
			total: pagination.total,
			page: pagination.page || page,
			limit: pagination.limit || limit,
			totalPages: pagination.pages || Math.ceil(pagination.total / (pagination.limit || limit)),
		};
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch admin classes";
		return rejectWithValue(errorMessage);
	}
});

export const fetchCourseClassOptionsForScanner = createAsyncThunk<
	CourseClassOption[],
	void,
	{ rejectValue: string }
>("classes/fetchCourseClassOptions", async (_, { rejectWithValue }) => {
	try {
		console.log("Dispatching fetchCourseClassOptionsForScanner thunk");
		const response = await get<any>("/class-sessions/options");
		console.log("Received class options response:", response);
		let responseData;
		if (response.success && Array.isArray(response.data)) {
			return response.data.map((item: any) => ({
				id: item.id,
				courseName: item.courseTitle || item.title,
				sessionName: item.description || `${new Date(item.startTime).toLocaleTimeString()} - ${new Date(item.endTime).toLocaleTimeString()}`
			}));
		}
		if (response.data && response.data.courses && response.data.timeSlots) {
			responseData = response.data;
		} else if (response.success && response.data) {
			responseData = response.data;
		} else if (response.courses && response.timeSlots) {
			responseData = response;
		} else {
			console.error("Invalid response format:", response);
			throw new Error("Invalid response format from class options API");
		}
		const transformedOptions: CourseClassOption[] = [];
		const { courses, timeSlots } = responseData;
		courses.forEach((course: any) => {
			timeSlots.forEach((timeSlot: any) => {
				transformedOptions.push({
					id: `${course.id}_${timeSlot.id}`,
					courseName: course.name,
					sessionName: timeSlot.name,
				});
			});
		});
		console.log("Transformed course class options:", transformedOptions);
		return transformedOptions;
	} catch (e: any) {
		console.error("Error fetching course class options:", e);
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch class session options";
		return rejectWithValue(errorMessage);
	}
});

export const fetchClassById = createAsyncThunk<
	AdminClassView,
	string,
	{ rejectValue: string }
>("classes/fetchById", async (classId, { rejectWithValue }) => {
	try {
		const response = await get<any>(`/classes/${classId}`);
		console.log("fetchClassById response:", response);
		let cls: any;
		if (response.success && response.data) {
			cls = response.data;
			console.log("Class data extracted from response.data:", cls);
		} else {
			cls = response;
			console.log("Using direct response as class data:", cls);
		}
		return {
			id: cls.id,
			name: cls.name || "",
			courseTitle: cls.name || cls.title || "",
			courseId: cls.courseId || cls.course_id || "",
			course_id: cls.courseId || cls.course_id || "",
			teacherName: cls.teacherName || cls.teacher_name || (cls.teacher ? cls.teacher.name : "N/A"),
			teacherId: cls.teacherId || cls.teacher_id || null,
			teacher_id: cls.teacherId || cls.teacher_id || null,
			teacher: cls.teacher,
			studentCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			max_students: cls.maxStudents || cls.max_students || 30,
			maxStudents: cls.maxStudents || cls.max_students || 30,
			max_slots: cls.maxSlots || cls.max_slots,
			maxSlots: cls.maxSlots || cls.max_slots,
			available_slots: cls.availableSlots || cls.available_slots,
			availableSlots: cls.availableSlots || cls.available_slots,
			enroled_students_count: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			enroledStudentsCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
			isActive: cls.isActive,
			startDate: cls.startDate || cls.start_date || "",
			start_date: cls.startDate || cls.start_date || "",
			endDate: cls.endDate || cls.end_date || "",
			end_date: cls.endDate || cls.end_date || "",
			description: cls.description || "",
			schedule: cls.schedule || { days: [], time: "", duration: "" },
			location: cls.location || "",
			course: cls.course,
			metadata: cls.metadata,
			createdAt: cls.createdAt || cls.created_at,
			created_at: cls.createdAt || cls.created_at,
			updatedAt: cls.updatedAt || cls.updated_at,
			updated_at: cls.updatedAt || cls.updated_at,
		};
	} catch (e: any) {
		const errorMsg =
			e.response?.data?.message ||
			e.message ||
			`Failed to fetch class ${classId}`;
		return rejectWithValue(errorMsg);
	}
});

export const createClass = createAsyncThunk<
	AdminClassView,
	CreateClassPayload,
	{ rejectValue: string }
>("classes/create", async (classData, { rejectWithValue }) => {
	try {
		const backendData = {
			name: classData.courseTitle,
			course_id: classData.courseId,
			teacher_id: classData.teacherId,
			isActive: classData.status === "active" ? 1 : 0,
			start_date: classData.startDate,
			end_date: classData.endDate,
			description: classData.description,
			max_students: classData.maxStudents,
			max_slots: classData.maxSlots,
			location: classData.location,
			schedule: classData.schedule,
			...classData,
		};
		const response = await post<any>("/classes", backendData);
		console.log("createClass response:", response);
		let cls: any;
		if (response.success && response.data) {
			cls = response.data;
			console.log("Class data extracted from response.data:", cls);
		} else {
			cls = response;
			console.log("Using direct response as class data:", cls);
		}
		return {
			id: cls.id,
			name: cls.name || "",
			courseTitle: cls.name || cls.title || "",
			courseId: cls.courseId || cls.course_id || "",
			course_id: cls.courseId || cls.course_id || "",
			teacherName: cls.teacherName || cls.teacher_name || (cls.teacher ? cls.teacher.name : "N/A"),
			teacherId: cls.teacherId || cls.teacher_id || null,
			teacher_id: cls.teacherId || cls.teacher_id || null,
			teacher: cls.teacher,
			studentCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			max_students: cls.maxStudents || cls.max_students || 30,
			maxStudents: cls.maxStudents || cls.max_students || 30,
			max_slots: cls.maxSlots || cls.max_slots,
			maxSlots: cls.maxSlots || cls.max_slots,
			available_slots: cls.availableSlots || cls.available_slots,
			availableSlots: cls.availableSlots || cls.available_slots,
			enroled_students_count: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			enroledStudentsCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
			isActive: cls.isActive,
			startDate: cls.startDate || cls.start_date || "",
			start_date: cls.startDate || cls.start_date || "",
			endDate: cls.endDate || cls.end_date || "",
			end_date: cls.endDate || cls.end_date || "",
			description: cls.description || "",
			schedule: cls.schedule || { days: [], time: "", duration: "" },
			location: cls.location || "",
			course: cls.course,
			metadata: cls.metadata,
			createdAt: cls.createdAt || cls.created_at,
			created_at: cls.createdAt || cls.created_at,
			updatedAt: cls.updatedAt || cls.updated_at,
			updated_at: cls.updatedAt || cls.updated_at,
		};
	} catch (e: any) {
		const errorMsg =
			e.response?.data?.message || e.message || "Failed to create class";
		return rejectWithValue(errorMsg);
	}
});

export const updateClass = createAsyncThunk<
	AdminClassView,
	UpdateClassPayload,
	{ rejectValue: string }
>("classes/update", async (payload, { rejectWithValue }) => {
	const { id, ...updateData } = payload;
	if (!id) {
		return rejectWithValue("Class ID is required for update.");
	}
	try {
		const backendData = {
			...(updateData.courseTitle && { name: updateData.courseTitle }),
			...(updateData.courseId && { course_id: updateData.courseId }),
			...(updateData.teacherId && { teacher_id: updateData.teacherId }),
			...(updateData.status && { isActive: updateData.status === "active" ? 1 : 0 }),
			...(updateData.startDate && { start_date: updateData.startDate }),
			...(updateData.endDate && { end_date: updateData.endDate }),
			...(updateData.maxStudents && { max_students: updateData.maxStudents }),
			...(updateData.maxSlots && { max_slots: updateData.maxSlots }),
			...(updateData.location && { location: updateData.location }),
			...(updateData.schedule && { schedule: updateData.schedule }),
			...updateData,
		};
		const response = await put<any>(`/classes/${id}`, backendData);
		console.log("updateClass response:", response);
		let cls: any;
		if (response.success && response.data) {
			cls = response.data;
			console.log("Class data extracted from response.data:", cls);
		} else {
			cls = response;
			console.log("Using direct response as class data:", cls);
		}
		return {
			id: cls.id,
			name: cls.name || "",
			courseTitle: cls.name || cls.title || "",
			courseId: cls.courseId || cls.course_id || "",
			course_id: cls.courseId || cls.course_id || "",
			teacherName: cls.teacherName || cls.teacher_name || (cls.teacher ? cls.teacher.name : "N/A"),
			teacherId: cls.teacherId || cls.teacher_id || null,
			teacher_id: cls.teacherId || cls.teacher_id || null,
			teacher: cls.teacher,
			studentCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			max_students: cls.maxStudents || cls.max_students || 30,
			maxStudents: cls.maxStudents || cls.max_students || 30,
			max_slots: cls.maxSlots || cls.max_slots,
			maxSlots: cls.maxSlots || cls.max_slots,
			available_slots: cls.availableSlots || cls.available_slots,
			availableSlots: cls.availableSlots || cls.available_slots,
			enroled_students_count: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			enroledStudentsCount: cls.enroledStudentsCount || cls.enroled_students_count || 0,
			status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
			isActive: cls.isActive,
			startDate: cls.startDate || cls.start_date || "",
			start_date: cls.startDate || cls.start_date || "",
			endDate: cls.endDate || cls.end_date || "",
			end_date: cls.endDate || cls.end_date || "",
			description: cls.description || "",
			schedule: cls.schedule || { days: [], time: "", duration: "" },
			location: cls.location || "",
			course: cls.course,
			metadata: cls.metadata,
			createdAt: cls.createdAt || cls.created_at,
			created_at: cls.createdAt || cls.created_at,
			updatedAt: cls.updatedAt || cls.updated_at,
			updated_at: cls.updatedAt || cls.updated_at,
		};
	} catch (e: any) {
		const errorMsg =
			e.response?.data?.message || e.message || "Failed to update class";
		return rejectWithValue(errorMsg);
	}
});

export const deleteClass = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>("classes/delete", async (classId, { rejectWithValue }) => {
	try {
		const response = await del<any>(`/classes/${classId}`);
		if (response && response.success) {
			return classId;
		} else if (response) {
			return classId;
		}
		return classId;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to delete class";
		return rejectWithValue(errorMessage);
	}
});
