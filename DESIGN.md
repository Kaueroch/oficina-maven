# DESIGN.md - Oficina Maven

## Context (from discovery)

- Artifact type: functional tool (pom.xml generator)
- Positioning: utilitarian, a little playful
- Audience: Java devs starting a Maven project | Primary action: download the pom.xml
- Adjectives: workshop-like, direct, trustworthy, analog
- Aesthetic essence: printed work order
- Mode: light | Density: balanced

## Aesthetic

- Direction: borrowed form, the carbonless pad of a Brazilian auto-shop work order
- Defining trait: every element is part of the printed form; red ink with a filled header band, typewritten values, coloured copies
- Signature move: the 2nd copy on canary-yellow paper is the pom.xml, as a carbon copy; the pink and blue copies are fanned out behind it, and the field being edited is highlighted with fluorescent highlighter

## Typography

- Printed form: Archivo (Google, OFL), width axis condensed at 62-90% for headers and labels
- Typewritten values and code: Courier Prime (Google, OFL)
- Scale: base 16px; labels .78rem, body .9-1.05rem, h2 1.15rem, h1 1.9-2.6rem

## Color

- balcao (page bg, petrol teal): #11727b
- papel (1st copy): #fffefa | canario (2nd copy): #ffe866 | rosa (3rd copy): #ffb3c7 | azul (4th copy): #9fd6f7
- tinta (red print ink, header band, primary action, errors): #c41f2b
- maquina (typed values): #1e2026 | carbono (carbon-copy text): #283a63
- numerador (form number): #0b6ea8
- marca-texto (fluorescent highlighter: active field, checked option): #b8f53d

## Rules

- Radius: 2px on buttons, 0 elsewhere (paper and printed cells)
- Shadow: only on the sheets (soft elevation, no border)
- Borders: 1.5px ink on cells, 3px ink under headers
- Motion: only 150ms ease-out on the highlighter; respects prefers-reduced-motion
- Focus: cell tinted plus 2px inset ink; checkboxes with 2px outline

## Slop audit (v1)

- Avoided: dark theme with a single accent, generic fonts, eyebrows, SaaS cards, mono for small labels
- Pending: check the render in a browser (no browser was available when it was built)

## Changelog

- v2: more colour (red ink, coloured copies, teal counter, green highlighter)
