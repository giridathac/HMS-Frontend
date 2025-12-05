# PageLayout Template

A reusable layout template component for all screens in the HMS application. This template provides consistent spacing, header layout, and scrollable content areas.

## Usage

### Basic Usage

```tsx
import { PageLayout } from './layouts/PageLayout';

export function MyComponent() {
  return (
    <PageLayout
      title="My Screen Title"
      description="Description of what this screen does"
    >
      {/* Your content here */}
    </PageLayout>
  );
}
```

### With Header Actions

```tsx
import { PageLayout } from './layouts/PageLayout';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function MyComponent() {
  const headerActions = (
    <Button>
      <Plus className="size-4" />
      Add Item
    </Button>
  );

  return (
    <PageLayout
      title="My Screen Title"
      description="Description of what this screen does"
      headerActions={headerActions}
    >
      {/* Your content here */}
    </PageLayout>
  );
}
```

### With Scrollable Content (for tables/lists)

```tsx
import { PageLayout } from './layouts/PageLayout';

export function MyComponent() {
  return (
    <PageLayout
      title="My Screen Title"
      description="Description of what this screen does"
      scrollableContent={true}
    >
      <table className="w-full">
        {/* Table content */}
      </table>
    </PageLayout>
  );
}
```

## Props

- `title` (string, required): The main heading for the page
- `description` (string, optional): Subtitle/description text below the title
- `headerActions` (ReactNode, optional): Action buttons or elements to display in the header
- `children` (ReactNode, required): The main content of the page
- `scrollableContent` (boolean, optional): If true, wraps content in a scrollable container with border
- `contentClassName` (string, optional): Additional CSS classes for the content area

## Features

- Consistent spacing (minimal top padding, no bottom padding)
- Compact header with title and description
- Flexible header actions area
- Scrollable content container when needed
- Proper viewport height calculations
- Responsive layout with flexbox

## Example: Converting an Existing Screen

**Before:**
```tsx
return (
  <div className="p-8 bg-blue-100 min-h-full">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-blue-900 mb-2">My Screen</h1>
        <p className="text-gray-500">Description</p>
      </div>
    </div>
    <Card>
      <CardContent className="p-6">
        {/* Content */}
      </CardContent>
    </Card>
  </div>
);
```

**After:**
```tsx
import { PageLayout } from './layouts/PageLayout';

return (
  <PageLayout
    title="My Screen"
    description="Description"
  >
    {/* Content */}
  </PageLayout>
);
```


