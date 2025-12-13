# Standard Dialog Design Scheme

This document defines the centralized design scheme for all dialogs in the project. Use these classes and patterns to maintain consistency across all dialogs.

## Standard Dialog Structure

### DialogContent
```tsx
<DialogContent className="p-0 gap-0 large-dialog bg-white">
```

### DialogHeader
```tsx
<DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 bg-white">
  <DialogTitle className="text-gray-700">Dialog Title</DialogTitle>
</DialogHeader>
```

### Dialog Body (Scrollable Content)
```tsx
<div className="flex-1 overflow-y-auto px-6 pb-1 dialog-content-scrollable min-h-0 bg-white">
  <div className="space-y-4 py-4">
    {/* Your form content here */}
  </div>
</div>
```

### Dialog Footer
```tsx
<div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
  <Button variant="outline" onClick={onCancel} className="py-1">Cancel</Button>
  <Button onClick={onSubmit} className="py-1">Submit</Button>
</div>
```

## Form Elements

### Labels
```tsx
<Label className="text-gray-600">Label Text</Label>
```

### Input Fields
```tsx
<Input className="text-gray-700 bg-gray-100" />
```

### Select Dropdowns
```tsx
<select className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700 bg-gray-100">
  <option>Option 1</option>
</select>
```

### Textareas
```tsx
<Textarea className="text-gray-700 bg-gray-100" />
```

## Complete Example

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="p-0 gap-0 large-dialog bg-white">
    <div className="flex-1 overflow-y-auto dialog-content-scrollable min-h-0 bg-white max-h-[90vh]">
      <DialogHeader className="px-6 pt-4 pb-3 bg-white">
        <DialogTitle className="text-gray-700">Dialog Title</DialogTitle>
      </DialogHeader>
      <div className="px-6 pb-1">
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-gray-600">Field Label</Label>
            <Input className="text-gray-700 bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
        <Button variant="outline" onClick={() => setIsOpen(false)} className="py-1">Cancel</Button>
        <Button onClick={handleSubmit} className="py-1">Submit</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

## Using StandardDialog Component

Alternatively, use the `StandardDialog` component for automatic styling:

```tsx
import { StandardDialog } from './ui/StandardDialog';

<StandardDialog
  trigger={<Button>Open</Button>}
  title="Dialog Title"
  defaultFooter={{
    onCancel: () => setIsOpen(false),
    onSubmit: handleSubmit,
    cancelLabel: "Cancel",
    submitLabel: "Save"
  }}
>
  <div>
    <Label className="text-gray-600">Field Label</Label>
    <Input className="text-gray-700 bg-gray-100" />
  </div>
</StandardDialog>
```

## Scrollbar Styling

The dialog content uses the `dialog-content-scrollable` class which provides:
- 8px width scrollbar
- Black track (#000000)
- Grey thumb (#9ca3af) with 2px black border
- Lighter grey on hover (#d1d5db)

This matches the left panel navigation scrollbar style.
