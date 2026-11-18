# Balance Buddy · ET 617 End-Sem · 24B0748

Adaptive tutor for **linear equations in one variable (Class 8)** for an anxious learner repeating the topic, with a **teacher-in-the-loop** view.

- **Live:** https://et617-24b0748.vercel.app
- **Report:** [REPORT.md](REPORT.md) · **Design:** [DESIGN.md](DESIGN.md)
- **Stack:** React + Vite (official `react` template), plain CSS, localStorage. No backend, no API keys.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```
Teacher view: header → **Teacher**, demo PIN **617**.

## How the tutor adapts (P4 design challenge)
| Condition | Next move |
|---|---|
| Correct 2 in a row (with an acceptable explanation when asked) | Harder question (level + 1) |
| Wrong, matches a known misconception (first time) | Alternative explanation + similar item on that misconception |
| Wrong and unrecognised, or same misconception again | Prerequisite refresher, then an easier level |

Code: `src/lib/tutor.js` (`decide`), `src/lib/generator.js`, `src/lib/diagnose.js`.

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
- Learner and teacher share one device's localStorage (no backend); in a real school this would sync to a server. Demo PIN 617 shown on purpose.

## AI-usage note
Code written by Claude (Anthropic) in one chat from my brief and decisions; I chose the card, reviewed each feature and tested it on the live app. Chat link in the report.

## Done / next
- [x] DESIGN.md, scaffold, shell, generator, diagnosis, decision rule, all screens, teacher view
- [ ] live test both scenarios, accessibility pass, README
