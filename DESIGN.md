# DESIGN.md - Oficina Maven

## Context

- Artifact type: functional tool (pom.xml generator)
- Audience: Java devs starting a Maven project | Primary action: download the pom.xml
- Reference requested by the user: the layout of the Spring Initializr (start.spring.io). We follow the structure and the feel, without using the Spring logo, name or brand.
- Mode: light | Density: balanced

## Aesthetic

- Header with the wordmark ("oficina" in green, "maven" in bold black) and a rule below it
- Two columns: options on the left, pom.xml preview on the right, with a vertical divider
- Label + field rows, label aligned right, field underlined with a 3px black line
- Radios: hollow black circle; selected becomes a green dot with green text
- Action bar fixed at the bottom (light grey-green background), buttons with a 2px black outline, uppercase text, shortcut next to them

## Typography

- Interface: Karla (Google, OFL)
- Code: JetBrains Mono (Google, OFL)

## Color

- fundo #ffffff | texto #1b1f23 | apagado #5e6670 | linha #dde5e5
- verde #5fa134 (selection, focus, values in the pom) | verde-claro #e3f1d8 (field being edited)
- barra #ebf1f1 | erro #c0262d
- Dark: fundo #1b1f23 | texto #f1f3f4 | apagado #a3abb3 | linha #353b41 | verde #7cc24e | barra #262b30 | erro #ff7a7f
- Theme: follows the system; the sun/moon toggle in the header saves the choice in localStorage

## Changelog

- v1: work order pad
- v2: more colour
- v3: Spring Initializr-style layout, at the user's request
- v4: light/dark theme toggle
