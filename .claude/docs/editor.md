# Rich Text Editor

Location: `components/rich-text-editor/`

Built with Lexical editor.

## Custom Nodes

- `ImageNode`
- `VideoNode`
- `CustomCodeHighlightNode`

## Plugins

- `CodeHighlightPlugin` - syntax highlighting with Shiki (vitesse themes)
- `ImagePlugin` - image node support
- `VideoPlugin` - video node support
- `LinkClickPlugin` - Cmd/Ctrl+click to open links, click to edit
- `LinkDialog` - insert/edit link dialog
- `MediaUploadDialog` - upload images/videos
- `useToolbarState` hook - toolbar button state management

## Usage

Exports Markdown via `getMarkdown()` method on editor ref.
