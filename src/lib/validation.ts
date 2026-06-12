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
