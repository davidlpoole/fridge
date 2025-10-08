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
