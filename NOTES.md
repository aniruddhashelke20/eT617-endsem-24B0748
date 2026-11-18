# NOTES.md — build log (24B0748)

Card: **P4 Adaptive tutor · P4-T3 Linear equations (Cl. 8) · L5 Anxious repeat learner · C5 Teacher-in-the-loop**. Full design in `DESIGN.md`.
(18:17 – switched T1 Integers → T3 Linear equations before first deploy. The engine — decision rule, diagnostic, teacher view — was topic-independent, so only content files changed.)

## Persona (short)
Riya Pawar, 14, Class 8, repeating linear equations after failing (8/25). **M1** x + 5 = 12 → 17 (sign not changed), **M2** 3x = 12 → 9 (subtracts instead of divides), M3 divides only some terms. Mother's Android phone, ~20 min at night.

## Objectives
1. Solve one/two-step equations (≥ 80 %). 2. Explain steps as the balance rule. 3. Verify a solution by substitution.

## Features → learning theory
| # | Feature | Theory |
|---|---|---|
| 1 | App shell, resume, calm welcome, roll no. footer | Self-efficacy (Bandura), affective filter: no timer, private, "mistakes are fine" |
| 2 | Question generator with misconception "traps" | Diagnostic assessment / error analysis: wrong answers are data |
| 3 | Decision rule: harder / alternative / prerequisite | Adaptive tutoring, ZPD (Vygotsky), mastery learning (Bloom): 2-in-a-row to level up |
| 4 | Balance scale (+ tilted balance when a wrong x is put back) | Concrete→representational (Bruner), dual coding; cognitive conflict (Piaget) |
| 5 | Learn screen (4 short steps) | Cognitive load (one idea per screen), signalling, conversational style (Mayer) |
| 6 | Practice + Feedback (5 formats, hint without penalty, "Why this next step?") | Formative feedback (Hattie), refutation text, transparent adaptivity |
| 7 | Diagnostic: 3 warm-ups + confidence → start level & focus | Profile adaptivity; affect-aware start |
| 8 | Refresher (opposite operations) + Summary in words not % | Prerequisite sequencing (Gagné); growth framing for L5 |
| 10 | Fill-in-the-blanks ("To undo division by 4, we ____ both sides by __") with a free-text operation word (synonyms accepted) + number | Recall of the inverse-operation rule in words (generation effect); blank answers are diagnosed (wrong inverse → M1/M2) |
| 9 | Teacher view: progress, approve/override feedback, override level/focus, log | C5 human-in-the-loop; teacher as orchestrator |

## File map
- `src/App.jsx` – screen state machine + header/footer
- `src/lib/storage.js` – one localStorage object, saved on every change (resume)
- `src/lib/generator.js` – templates (x+b=c, ax=c, ax+b=c) × level × focus; stores `traps`, `stepTraps`, worked `steps`
- `src/lib/diagnose.js` – correct / M1 / M2 / M3 / unknown; alternative explanations; substitution back-check; explanation checker
- `src/lib/tutor.js` – **the decision rule** `decide()` + reason shown to the learner
- `src/components/Balance.jsx` – SVG balance (balanced / tilted)
- `src/screens/*` – Welcome, Diagnostic, Learn, Practice, Feedback, Prereq, Summary, Teacher, About

## Decisions
- No backend / no API key: question generation and explanation feedback are rule-based in the browser — offline-safe, deterministic and explainable in the viva. The teacher review queue (C5) is the human check on automated feedback.
- A wrong answer is matched against each misconception's predicted answer (x + 5 = 12: M1 predicts 17). That makes diagnosis specific instead of just "wrong".
- Same misconception twice → prerequisite (the alternative explanation didn't work, so step back one level).
- Wrong value is substituted back and shown on a tilted balance: the learner sees *why* it is wrong without being told "wrong" — less threatening for L5.
- 18:50 – explanation checker rewritten after my test: it used to return one of three fixed messages from keywords. Now it checks the substitution steps (claimed x used? left side computed right? compared with right side? reason agrees with Yes/No?) and builds ✓/↻ feedback from the learner's own numbers. A right Yes/No with no real reason no longer counts towards level-up.
- 19:01 – from my testing: (1) the teacher's note shown to the learner now repeats the question, her Yes/No and her reason, so the review isn't out of context; (2) conclusion-only reasons ("doesn't satisfy the equation") are recognised — credited if true, then the substitution is shown.
- 19:14 – a strong reason now just gets "✓ Good reasoning!" (no checklist). Added the fill-in-the-blanks format at Levels 1–2, including x ÷ a = c items with their own alternative explanation.
- 19:19 – answering "No" and giving the correct x ("x should be 4", "x = 4", or just "4") now counts as a valid reason. If that number also appears in the equation (4x = 16 → x = 4), the checker needs "x = 4" / "it's 4" or an operation word, so a copied coefficient is not credited.
- Learner and teacher share one device's localStorage (no backend); in a real school this would sync to a server. Demo PIN 617 shown on purpose.

## AI-usage note
Code written by Claude (Anthropic) in one chat from my brief and decisions; I chose the card, reviewed each feature and tested it on the live app. Chat link in the report.

## Done / next
- [x] DESIGN.md, scaffold, shell, generator, diagnosis, decision rule, all screens, teacher view
- [ ] live test both scenarios, accessibility pass, README
