# Switch This UI Component Library

This document outlines the UI components available in the Switch This application, along with their styling guidelines.

## Theme Colors

The application uses a consistent color palette defined in the Tailwind configuration:

- **Primary Colors**: Blue shades (`primary-50` through `primary-900`)
- **Secondary Colors**: Purple shades (`secondary-50` through `secondary-900`)

Additional semantic colors are used throughout the components:
- Success: Green
- Danger: Red
- Warning: Amber/Yellow
- Info: Blue
- Gray: Neutral grays

## Components

### Alert
Displays important messages to users with various semantic styles.
- Variants: `info`, `success`, `warning`, `error`, `primary`, `secondary`
- Supports title, content, icon and dismiss button

### Badge
Compact elements for status, categories, or labels.
- Variants: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `gray`
- Sizes: `xs`, `sm`, `md`, `lg`
- Supports outline style

### Breadcrumbs
Navigation aid to show user's location in the application.
- Supports custom separators
- Supports icons in breadcrumb items

### Button
Primary interactive element.
- Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`
- Sizes: `sm`, `md`, `lg`
- Supports loading state and icons

### Card
Container for grouping related content.
- Variants: `default`, `outlined`, `elevated`
- Subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Supports hover effects

### DataTable
Displays tabular data with various configuration options.
- Supports loading state, error state, empty state
- Configurable column rendering
- Supports row click handlers
- Options for zebra striping, borders, and density

### Dialog
Modal dialogs for focused user interactions.
- Supports various sizes
- Includes `ConfirmDialog` variant for confirmation actions
- Supports custom header, content, and footer

### Form Components
Components for building forms.
- `Form`: Container with consistent spacing
- `FormGroup`: Groups related input elements
- `FormLabel`: Accessible labels with required indicator support
- `FormError`: Error messages with accessibility support
- `FormHint`: Helper text for form fields
- `FormSection`: Logical grouping of form fields with titles
- `FormActions`: Container for form buttons with alignment options

### Input
Text input field with label and error handling.
- Supports left and right icons
- Integrates with form validation
- Supports full width option

### LoadingSpinner
Indicates loading states.
- Sizes: `xs`, `sm`, `md`, `lg`
- Colors: `primary`, `secondary`, `white`, `gray`
- Optional label

### PageContainer
Consistent page layout container.
- Support for page title, description
- Action buttons area
- Handles loading and error states
- Configurable container widths

### ScrollArea
Customizable scrollable container.
- Uses Radix UI components
- Customizable scrollbar colors

### Select
Dropdown selection input.
- Consistent styling with Input component
- Supports label, error states
- Various sizes and full width option

### Toggle
Switch control for boolean options.
- Sizes: `sm`, `md`, `lg`
- Colors: `primary`, `secondary`, `success`, `danger`, `gray`
- Supports label on either side

### Tooltip
Contextual information on hover.
- Positions: `top`, `right`, `bottom`, `left`
- Variants: `dark`, `light`, `primary`
- Configurable delay

## Usage Guidelines

1. **Consistency**: Use the same component for the same purpose throughout the application.
2. **Semantics**: Use semantic colors appropriately (e.g., `danger` for destructive actions).
3. **Accessibility**: Ensure proper labels, ARIA attributes, and keyboard navigation.
4. **Responsiveness**: Components are designed to work at various screen sizes.

## Extending Components

When extending or creating new components:
1. Use the `cn` utility from `@/lib/utils` for merging class names
2. Follow the established pattern of accepting `className` props
3. Use Tailwind's theme colors for consistency
4. Include appropriate accessibility attributes
5. Add display names to components
6. Export from the central `index.ts` file 