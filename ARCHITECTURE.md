# Fridge Recipes - Component Architecture

## Overview
This document describes the component architecture after refactoring the monolithic `page.tsx` into focused, reusable components.

## Directory Structure

```
src/
├── app/
│   └── page.tsx                    # Main page component (orchestrator)
├── components/                      # Reusable UI components
│   ├── IngredientInput.tsx         # Input field for adding ingredients
│   ├── IngredientList.tsx          # List with edit/remove functionality
│   ├── RecipeDisplay.tsx           # Display area for recipe results
│   ├── RecipeForm.tsx              # Form for requirements + submit
│   ├── SettingsButton.tsx          # Floating settings button
│   └── SettingsModal.tsx           # Modal for API key configuration
├── hooks/                           # Custom React hooks
│   └── useLocalStorage.ts          # Hook for localStorage state management
└── lib/                             # Shared utilities and constants
    └── constants.ts                 # Storage keys and constants
```

## Component Responsibilities

### `page.tsx` (Main Orchestrator)
- **Purpose**: Coordinate all components and manage application state
- **State Management**: 
  - Items list (via `useLocalStorage`)
  - API key (via `useLocalStorage`)
  - User requirements (via `useLocalStorage`)
  - Loading state
  - Recipes result
  - Settings modal visibility
- **Key Functions**:
  - `addItem()` - Add new ingredient
  - `removeItem()` - Remove ingredient by index
  - `editItem()` - Update ingredient value
  - `getRecipes()` - Fetch recipes from API
  - Settings modal handlers

### `SettingsButton.tsx`
- **Purpose**: Fixed button to open settings
- **Props**: `onClick: () => void`
- **Features**: Floating gear icon in top-right corner

### `SettingsModal.tsx`
- **Purpose**: Modal dialog for API key configuration
- **Props**:
  - `isOpen: boolean` - Visibility state
  - `apiKey: string` - Current API key
  - `onClose: () => void` - Close handler
  - `onSave: (apiKey: string) => void` - Save handler
- **Features**: 
  - Internal state for temporary API key
  - Click-outside-to-close
  - Link to Groq Console

### `IngredientInput.tsx`
- **Purpose**: Input field for adding new ingredients
- **Props**: `onAdd: (item: string) => void`
- **Features**:
  - Internal state for input value
  - Enter key submission
  - Auto-clear after adding

### `IngredientList.tsx`
- **Purpose**: Display and manage list of ingredients
- **Props**:
  - `items: string[]` - Array of ingredients
  - `onRemove: (index: number) => void` - Remove handler
  - `onEdit: (index: number, newValue: string) => void` - Edit handler
- **Features**:
  - Click-to-edit functionality
  - Inline editing with save/cancel
  - Empty state message
  - Hover effects

### `RecipeForm.tsx`
- **Purpose**: Dietary requirements input and submit button
- **Props**:
  - `userRequirements: string` - Current requirements
  - `onRequirementsChange: (value: string) => void`
  - `onSubmit: () => void` - Submit handler
  - `loading: boolean` - Loading state
  - `hasItems: boolean` - Enable/disable submit
- **Features**:
  - Textarea for requirements
  - Submit button with loading state
  - Disabled when no items

### `RecipeDisplay.tsx`
- **Purpose**: Display generated recipes
- **Props**: `recipes: string` - Recipe text to display
- **Features**: Formatted pre-wrap display, conditional rendering

## Custom Hooks

### `useLocalStorage<T>(key: string, initialValue: T)`
- **Purpose**: Synchronize state with localStorage
- **Returns**: `[value, setValue]` (same API as `useState`)
- **Features**:
  - Automatic serialization/deserialization
  - Error handling for parse failures
  - Persistence across page reloads

## Constants

### `lib/constants.ts`
- `STORAGE_KEY` - localStorage key for ingredients
- `API_KEY_STORAGE_KEY` - localStorage key for API key
- `REQUIREMENTS_STORAGE_KEY` - localStorage key for requirements

## Design Principles

1. **Single Responsibility**: Each component handles one concern
2. **Props Over State**: Components receive data via props when possible
3. **Controlled Components**: Parent manages state, children render and emit events
4. **Type Safety**: All components use TypeScript interfaces
5. **Reusability**: Components are generic enough to be reused
6. **Testability**: Small, focused components are easier to test

## Data Flow

```
page.tsx (State Container)
    │
    ├─> SettingsButton ──> onClick ──> page.openSettings()
    │
    ├─> SettingsModal ──> onSave(key) ──> page.saveSettings(key)
    │
    ├─> IngredientInput ──> onAdd(item) ──> page.addItem(item)
    │
    ├─> IngredientList ──> onRemove(idx) ──> page.removeItem(idx)
    │                  └──> onEdit(idx, val) ──> page.editItem(idx, val)
    │
    ├─> RecipeForm ──> onSubmit() ──> page.getRecipes()
    │              └──> onRequirementsChange(val) ──> page.setUserRequirements(val)
    │
    └─> RecipeDisplay (recipes) ──> Display only
```

## Benefits of This Architecture

1. **Maintainability**: Changes to one component don't affect others
2. **Readability**: Each file is focused and easy to understand
3. **Reusability**: Components can be used in other pages
4. **Testability**: Small units are easier to test
5. **Type Safety**: TypeScript catches errors at compile time
6. **Performance**: Easier to optimize individual components
7. **Collaboration**: Multiple developers can work on different components

## Future Improvements

- Add unit tests for each component
- Extract API logic into a service layer
- Add loading/error states to components
- Consider using Context API for deeply nested props
- Add component documentation with Storybook
- Implement proper form validation
