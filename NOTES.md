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
| 2 | Question generator with misconception "traps" | Diagnostic assessment; error analysis (misconceptions as data, not just wrong) |
| 3 | Decision rule: harder / alternative explanation / prerequisite | Adaptive tutoring, ZPD (Vygotsky), mastery learning (Bloom): 2-in-a-row to level up |
| 4 | Number line (display + tap input + ◀ ▶) | Concrete→representational (Bruner); dual coding (words + picture); topic-specific tool (rubric T6) |
| 5 | Learn screen (4 short steps) | Cognitive load (one idea per screen), signalling with highlights, conversational style (Mayer) |
| 7 | Diagnostic: 3 warm-ups + confidence → start level & first focus | Profile adaptivity (rubric P13); affect-aware start for anxious learner |
| 8 | Prerequisite refresher (opposites) + Summary in words, not % | Prerequisite sequencing (Gagné); attribution / growth framing for L5 |
| 6 | Practice + Feedback (5 formats, hint without penalty, "Why this next step?") | Formative feedback (Hattie), refutation text for M1/M2, transparency of adaptivity |

## File map
- `src/App.jsx` – screen state machine + header/footer
- `src/lib/storage.js` – one localStorage object, save on every change (resume)
- `src/lib/config.js` – roll number
- `src/lib/generator.js` – question templates × level × focus misconception; each question stores `traps`
- `src/lib/diagnose.js` – correct / M1 / M2 / M3 / unknown; walk text; alternative explanations; explanation checker
- `src/lib/tutor.js` – **the decision rule** (`decide`) + reason shown to learner
- `src/components/NumberLine.jsx` – SVG number line, hops, tap/◀▶ input
- `src/screens/*` – one file per screen (Welcome, Learn, Practice, Feedback, About …)

## Decisions
- No backend / no API key: question generation and feedback are rule-based in the browser, so it works offline and is fully explainable in the viva. Teacher review (C5) is the safety check on automated feedback.
- A wrong answer is matched against each misconception's predicted answer (e.g. (−3)+(−5) → M1 predicts +8). That is what makes the diagnosis specific instead of "wrong".
- Same misconception twice → prerequisite (alternative explanation didn't work, so go one step back).
- Number-line input limited to −10..10 so taps fit a 360 px phone; ◀ ▶ buttons for keyboard/low-precision users.
- Single localStorage object → whole app state can be resumed or reset in one place.

## AI-usage note
Code written by Claude (Anthropic) in a single chat from my brief and decisions; I reviewed each feature. Chat link in the report.

## Done / next
- [x] DESIGN.md, scaffold, shell
- [ ] number line, generator + diagnosis, adaptive loop, diagnostic, prerequisite, teacher view
