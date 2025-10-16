// JSON Schema definitions for structured outputs

/**
 * Creates a JSON schema for recipe responses based on user settings
 */
export function createRecipeSchema(
  numRecipes: number,
  fullSteps: boolean
): {
  name: string;
  description: string;
  schema: { [key: string]: unknown };
  strict: boolean;
} {
  const baseRecipeProperties: { [key: string]: unknown } = {
    name: {
      type: "string",
      description: "The name of the recipe",
    },
    description: {
      type: "string",
      description: "A brief description of the recipe (2-3 sentences)",
    },
  };

  if (fullSteps) {
    baseRecipeProperties.steps = {
      type: "array",
      description: "Step-by-step preparation instructions",
      items: {
        type: "object",
        properties: {
          step_number: {
            type: "number",
            description: "The sequential number of this step",
          },
          instruction: {
            type: "string",
            description: "The instruction for this step",
          },
        },
        required: ["step_number", "instruction"],
        additionalProperties: false,
      },
    };
  }

  return {
    name: "recipe_suggestions",
    description: `Generate exactly ${numRecipes} recipe suggestion${
      numRecipes > 1 ? "s" : ""
    } based on the provided ingredients${
      fullSteps ? " with full preparation steps" : ""
    }`,
    schema: {
      type: "object",
      properties: {
        recipes: {
          type: "array",
          description: `An array of exactly ${numRecipes} recipe${
            numRecipes > 1 ? "s" : ""
          }`,
          items: {
            type: "object",
            properties: baseRecipeProperties,
            required: fullSteps
              ? ["name", "description", "steps"]
              : ["name", "description"],
            additionalProperties: false,
          },
        },
      },
      required: ["recipes"],
      additionalProperties: false,
    },
    strict: true,
  };
}
