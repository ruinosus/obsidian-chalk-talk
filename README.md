# Chalk Talk for Obsidian

Hand-drawn lessons that draw themselves, chapter by chapter, inside your notes.

````markdown
```chalk-talk
title Saving coins
param n "coins a month" 1..8 = 3

# The hook
> Ana keeps some coins every month.
person ana at 150,330 "Ana" mood=idea

# A year
> Each month, n coins go into the jar.
row at 470,150 gap 14
  repeat n: coin size 44
counter at 470,270 "12*n" "{v:0} coins in a year"
```
````

The block becomes the lesson: the chapters, Values and Expand on top; Back, Next, All and the narration below. It opens
on chapter 1, drawn and still, and moves only when you ask. **Expand** opens the whole lesson — values, a question to
think about, the quiz, a check of the drawing, and PNG, SVG, GIF and WebM downloads. In an exported PDF the drawing is
complete and still.

A Mermaid flowchart, hand-drawn — use `chalk-mermaid` (a plain `mermaid` block stays Obsidian's):

````markdown
```chalk-mermaid
flowchart LR
  %% title A coffee, from order to cup
  %% # The order
  %% > You order a coffee at the counter.
  A([You]) -->|orders| B[Cashier]
  %% # The kitchen
  B -->|ticket| C[Barista]
  C -.->|coffee| A
```
````

- A mistake in the text shows its line where the lesson would be.
- No theme in the recipe: the chalkboard on a dark Obsidian, the paper on a light one. Buttons in English or Portuguese,
  as Obsidian.
- Command: **Insert a chalk-talk lesson**.
- Everything is local: no network, no account.

The syntax: [text.md](https://github.com/ruinosus/chalk-talk/blob/main/skills/chalk-talk/references/text.md). The
lessons come from [chalk-talk](https://github.com/ruinosus/chalk-talk) (`chalk-talk/embed`), the same engine as its
Claude skill — ask Claude to explain something by drawing it and paste the text it writes into a note.

## Develop

```
npm install
npm run build     # main.js
```

Copy `main.js`, `manifest.json` and `styles.css` to `<vault>/.obsidian/plugins/chalk-talk/`.

MIT.
