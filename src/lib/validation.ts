import { z } from "zod";

export const GRADE_OPTIONS = [
  { value: 0, label: "Kindergarten" },
  { value: 1, label: "Grade 1" },
  { value: 2, label: "Grade 2" },
  { value: 3, label: "Grade 3" },
  { value: 4, label: "Grade 4" },
  { value: 5, label: "Grade 5" },
  { value: 6, label: "Grade 6" },
  { value: 7, label: "Grade 7" },
  { value: 8, label: "Grade 8" },
] as const;

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => v ?? "");

export const registrationSchema = z.object({
  slug: z.string().min(1),

  parent_first_name: z.string().trim().min(1, "Required").max(100),
  parent_last_name: z.string().trim().min(1, "Required").max(100),
  parent_email: z.email("Enter a valid email"),
  parent_phone: z.string().trim().min(7, "Enter a valid phone number").max(30),

  student_first_name: z.string().trim().min(1, "Required").max(100),
  student_last_name: z.string().trim().min(1, "Required").max(100),
  student_grade: z.coerce
    .number({ error: "Select a grade" })
    .int()
    .min(0, "Select a grade")
    .max(8, "Select a grade"),

  emergency_contact_name: optionalText,
  emergency_contact_phone: optionalText,
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const CATEGORY_OPTIONS = [
  { value: "chess", label: "Chess" },
  { value: "math", label: "Math" },
] as const;

export const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const optionalNullableText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const classInputSchema = z
  .object({
    title: z.string().trim().min(1, "Required").max(150),
    category: z.enum(["chess", "math"], { error: "Select a category" }),
    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => (v ? v : null)),
    term_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null)),
    location_id: optionalNullableText,
    day_of_week: z
      .enum(DAY_OPTIONS)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    start_time: optionalNullableText,
    end_time: optionalNullableText,
    grade_min: z.coerce
      .number({ error: "Select a grade" })
      .int()
      .min(0, "Select a grade")
      .max(12),
    grade_max: z.coerce
      .number({ error: "Select a grade" })
      .int()
      .min(0, "Select a grade")
      .max(12),
    price_dollars: z.coerce
      .number({ error: "Enter a price" })
      .min(0, "Price can't be negative")
      .max(100000),
    capacity: z.coerce
      .number({ error: "Enter a capacity" })
      .int("Enter a whole number")
      .min(1, "Capacity must be at least 1")
      .max(1000),
    is_published: z.coerce.boolean().optional().default(false),
  })
  .refine((v) => v.grade_max >= v.grade_min, {
    path: ["grade_max"],
    error: "Highest grade must be at or above the lowest grade",
  })
  .refine(
    (v) => !v.start_time || !v.end_time || v.end_time > v.start_time,
    {
      path: ["end_time"],
      error: "End time must be after the start time",
    },
  );

export type ClassInput = z.infer<typeof classInputSchema>;

export const locationInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(150),
  address: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : null)),
  city: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : "Jersey City")),
  state: z
    .string()
    .trim()
    .max(2)
    .optional()
    .transform((v) => (v ? v.toUpperCase() : "NJ")),
});

export type LocationInput = z.infer<typeof locationInputSchema>;

export const termInputSchema = z
  .object({
    name: z.string().trim().min(1, "Required").max(120),
    start_date: z.string().trim().min(1, "Required"),
    end_date: z.string().trim().min(1, "Required"),
    is_active: z.coerce.boolean().optional().default(true),
  })
  .refine((v) => v.end_date >= v.start_date, {
    path: ["end_date"],
    error: "End date must be on or after the start date",
  });

export type TermInput = z.infer<typeof termInputSchema>;
