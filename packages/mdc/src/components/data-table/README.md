# Data Table (`<mdc-data-table>`)

Material Design 3 Data Table component with column sorting, single/multiple row selection, contextual selection bar, loading progress indicator, sticky headers, and integrated `<mdc-pagination variant="compact">` footer.

## Usage

```html
<mdc-data-table title="Nutrition" selection-mode="multiple" paginated page-size="5"></mdc-data-table>
```

```ts
const table = document.querySelector('mdc-data-table')!
table.columns = [
    { key: 'name', label: 'Dessert', sortable: true },
    { key: 'calories', label: 'Calories', numeric: true, sortable: true },
    { key: 'fat', label: 'Fat (g)', numeric: true, sortable: true },
]
table.rows = [
    { id: '1', name: 'Frozen yogurt', calories: 159, fat: 6.0 },
    { id: '2', name: 'Ice cream sandwich', calories: 237, fat: 9.0 },
]
```

## Slots

| Slot | Description |
| :--- | :--- |
| `header` | Leading toolbar content when no rows are selected. |
| `header-actions` | Trailing toolbar actions when no rows are selected. |
| `selection-actions` | Contextual actions shown in the selection bar when rows are selected. |
| `empty` | Custom empty-state content when `rows` is empty. |
| `footer` | Custom footer content placed before the pagination control. |
