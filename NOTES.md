# NOTES.md — build log (24B0748)

Card: **P4 Adaptive tutor · P4-T1 Integers (Cl. 7) · L5 Anxious repeat learner · C5 Teacher-in-the-loop**. Full design in `DESIGN.md`.

## Persona (short)
Riya Pawar, 13, Class 7, Pune municipal school, repeating integers after failing (9/25). Misconceptions: **M1** (−3)+(−5)=+8 ("two minuses make a plus"), **M2** 5−(−3)=2 (ignores the sign of the subtracted number). Mother's Android phone, ~20 min at night.

## Objectives
1. Compute integer sums/differences (≥ 80 %). 2. Explain with a number line. 3. Predict the sign of a result.

## Features → learning theory
| # | Feature | Theory |
|---|---|---|
| 1 | App shell, resume, calm welcome, roll no. footer | Affective filter / self-efficacy (Bandura): no timer, private, "mistakes are fine" |

## File map
- `src/App.jsx` – screen state machine + header/footer
- `src/lib/storage.js` – one localStorage object, save on every change (resume)
- `src/lib/config.js` – roll number
- `src/screens/*` – one file per screen

## Decisions
- No backend / no API key: question generation and feedback are rule-based in the browser, so it works offline and is fully explainable in the viva. Teacher review (C5) is the safety check on automated feedback.
- Single localStorage object → whole app state can be resumed or reset in one place.

## AI-usage note
Code written by Claude (Anthropic) in a single chat from my brief and decisions; I reviewed each feature. Chat link in the report.

## Done / next
- [x] DESIGN.md, scaffold, shell
- [ ] number line, generator + diagnosis, adaptive loop, diagnostic, prerequisite, teacher view
