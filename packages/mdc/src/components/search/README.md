# Search

Material Design 3 Search consists of two coordinated components:

- `mdc-search-bar` — 56px pill-shaped search bar (standalone inline input or trigger for `mdc-search-view`).
- `mdc-search-view` — Expanded search view (`fullscreen` or `docked`) with back/clear actions, `OutlineVariant` divider, and scrollable suggestions/results slot.

## Coordination

Bind `mdc-search-bar` and `mdc-search-view` declaratively with `for`:

```html
<mdc-search-bar for="app-search-view" supporting-text="Search mail"></mdc-search-bar>
<mdc-search-view id="app-search-view" variant="docked" supporting-text="Search mail">
    <mdc-list>
        <mdc-list-item>Recent query</mdc-list-item>
    </mdc-list>
</mdc-search-view>
```

Or imperatively via `searchView.setupWithSearchBar(searchBar)`.

## Status

| Component       | Ready to use |
| :-------------- | -----------: |
| mdc-search-bar  |          Yes |
| mdc-search-view |          Yes |
