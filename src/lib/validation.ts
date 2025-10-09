import { z } from "zod";

// Request validation schemas
export const recipeRequestSchema = z.object({
  items: z
    .array(z.string().trim().min(1, "Item cannot be empty").max(100, "Item too long"))
    .min(1, "At least one item is required")
    .max(50, "Too many items (maximum 50)"),
  requirements: z
    .string()
    .max(500, "Requirements text is too long (maximum 500 characters)")
    .optional(),
});

export type RecipeRequestInput = z.infer<typeof recipeRequestSchema>;

// Validation helper function
export function validateRecipeRequest(data: unknown) {
  return recipeRequestSchema.safeParse(data);
}

// Authentication validation schemas
export const loginRequestSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
});

export const updateProfileSchema = z.object({
  dietary: z
    .string()
    .max(500, "Dietary requirements text is too long (maximum 500 characters)")
    .optional(),
  groq_api_key: z
    .string()
    .max(500, "API key is too long")
    .optional(),
});

export const syncDataSchema = z.object({
  items: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .optional()
    .default([]),
  dietary: z
    .string()
    .max(500)
    .optional()
    .default(""),
  groq_api_key: z
    .string()
    .max(500)
    .optional(),
});

export type LoginRequestInput = z.infer<typeof loginRequestSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SyncDataInput = z.infer<typeof syncDataSchema>;

export function validateLoginRequest(data: unknown) {
  return loginRequestSchema.safeParse(data);
}

export function validateUpdateProfile(data: unknown) {
  return updateProfileSchema.safeParse(data);
}

export function validateSyncData(data: unknown) {
  return syncDataSchema.safeParse(data);
}
