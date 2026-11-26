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
- Defining trait: every element is part of the printed form; one ink colour, typewritten values
- Signature move: the 2nd copy on canary-yellow paper is the pom.xml, as a carbon copy; the field being edited is circled in red pen on it

## Typography

- Printed form: Archivo (Google, OFL), width axis condensed at 62-90% for headers and labels
- Typewritten values and code: Courier Prime (Google, OFL)
- Scale: base 16px; labels .78rem, body .9-1.05rem, h2 1.15rem, h1 1.9-2.6rem

## Color

- balcao (page bg): #c7cbc4
- papel (1st copy): #fdfdf9
- canario (2nd copy): #f6eba3
- tinta (printed form, primary action): #0e5a52
- maquina (typed values): #1e2026
- carbono (carbon-copy text): #2f3c57
- numerador (form number, error, red pen): #c22a2f

## Rules

- Radius: 2px on buttons, 0 elsewhere (paper and printed cells)
- Shadow: only on the sheets (soft elevation, no border)
- Borders: 1.5px ink on cells, 3px ink under headers
- Motion: only 150ms ease-out on the red-pen circle; respects prefers-reduced-motion
- Focus: cell tinted plus 2px inset ink; checkboxes with 2px outline

## Slop audit (v1)

- Avoided: dark theme with a single accent, generic fonts, eyebrows, SaaS cards, mono for small labels
- Pending: check the render in a browser (no browser was available when it was built)
