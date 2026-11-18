# DESIGN.md — ET 617 End-Sem · 24B0748

## Identity card
| Field | Choice |
|---|---|
| ID | 24B0748 |
| P | P4 – Adaptive tutor with automatic question generation |
| T | P4-T3 – Linear equations in one variable (Class 8) |
| L | L5 – Learner repeating the topic after failing it once; high anxiety, low self-efficacy |
| C | C5 – Teacher-in-the-loop (teacher view shows progress; approve/override automated feedback) |

App: **Balance Buddy** · Live: `https://et617-24b0748.vercel.app`
(Card changed from T1 to T3 at 18:17, before the first deployment; this file was rewritten for T3.)

## D1 · Educational problem
Many Class 8 learners fail linear equations because they solve by half-remembered moves ("take it to the other side") instead of the idea that an equation is a balance. They move numbers across "=" without changing the sign, "undo" 3x by subtracting 3, or divide only part of the equation. A learner who has already failed once now guesses quickly, avoids explaining and never checks the answer. Worksheets give everyone the same items and mark right/wrong only, so the actual misconception is never found or repaired. The tutor must identify which wrong move the learner is making, repair it with the balance model, and rebuild confidence, while the teacher stays in control of automated feedback.

**Learning outcomes:**
1. **Solve** one-step and two-step linear equations (ax + b = c, integer solutions) with ≥ 80 % accuracy.
2. **Explain** each step as "doing the same opposite operation to both sides" of a balance.
3. **Verify** a proposed solution by substituting it back and judge whether it is correct (including a classmate's wrong solution).

**Context of use:** at home, 15–20 min in the evening on a parent's Android phone (Chrome); the class teacher checks progress and reviews feedback the next morning on the same device / a school phone.

## D2 · Learner persona
**Riya Pawar**, 14, Class 8, Pune Municipal school (semi-English medium; Marathi at home).
- **Prior knowledge (prerequisites):** integer addition/subtraction mostly fine; times tables secure; knows "x is an unknown"; inverse operations shaky; has never been asked to check an answer by substitution.
- **History:** failed the linear-equations unit test (8/25); repeating it; says "I'm just bad at maths".
- **Misconception M1 – moving a number across "=" without changing its sign:** x + 5 = 12 → x = 17.
- **Misconception M2 – undoing multiplication by subtracting:** 3x = 12 → x = 9.
- (Secondary, diagnosed) **M3 – dividing only some terms:** 2x + 4 = 10 → x + 4 = 5 → x = 1.
- **Device/time:** mother's Android phone, ~20 min after 8 pm, shared data pack.
- **Language:** reads short simple English; Marathi spoken at home.
- **Motivation:** wants to pass the re-test without embarrassment; prefers private practice; shuts down after 2–3 red crosses.

## D3 · Content plan
**Concept explanation (Learn, 4 short steps with a balance picture):** equation = balance → undo + with − on both sides → undo × with ÷ on both sides → two steps (remove the number first, then divide) and always check by substituting.

**Question formats (7):**
1. **Numeric** – Solve for x: 3x + 4 = 19
2. **Multiple choice** with diagnostic distractors (each wrong option = M1/M2/M3 answer)
3. **Choose the first step** – "What should we do to BOTH sides first?" (Subtract 4 / Add 4 / Subtract 3)
4. **Check a solution** – "Is x = 9 a solution of 3x = 12? Put it back in and explain." (yes/no + one line)
7. **Find the mistake** – a worked 2-step solution; which step is wrong (Step 1 / Step 2 / No mistake)?
6. **Fill in the blanks** – "To undo division by 4, we ____ both sides by __."
5. **Spot the error** – "Aarav solved x + 5 = 12 and got x = 17. Is he right? Explain."

Questions are **generated** from templates (x + b = c, ax = c, ax + b = c) using level and current misconception; each stores the answer each misconception would produce ("traps").

**Feedback examples:**
- Correct: "x + 5 = 12 → Subtract 5 from both sides → x = 7. Check: 7 + 5 = 12 ✓"
- M1 (answered 17): "Let's put x = 17 back in: 17 + 5 = 22, not 12" (tilted balance) → "Keep the balance: do the OPPOSITE to both sides…"
- M2 (answered 9): "3 × 9 = 27, not 12" (tilted balance) → "3x means 3 TIMES x — undo times with divide…"

## Adaptive decision rule (design challenge)
| Condition | Move |
|---|---|
| Correct (and explanation not "unclear", when asked) **2 in a row** at this level | **Harder question** (L1 one-step → L2 two-step → L3 check/spot-the-error, negatives) |
| Wrong and the answer **matches a known misconception** (first time) | **Alternative explanation** for that misconception + tilted balance, then a similar generated item focused on it |
| Wrong and **unrecognised**, OR the **same misconception again** right after its alternative explanation | **Prerequisite instruction** (opposite operations + balance rule, with a check), then an easier level |

Profile: a 3-item warm-up + confidence check sets start level and first focus. Interaction: hint use and time per question are logged; hints on 2 questions in a row → balance helper shown by default.

## C5 · Teacher-in-the-loop
Teacher view (PIN): warm-up result, level, attempts, misconception counts, hint use and time; **review queue** of automated feedback on explanations with **Approve / Override** (learner then sees "Your teacher reviewed your explanation"); teacher can **override the tutor's next step** (level, focus); attempt log with diagnosis and move.

## Screens
Welcome → Diagnostic → Learn → Practice ⇄ Feedback → (Refresher) → Summary; Teacher; About. Roll no. **24B0748** in the footer of every screen and on About.

## Stack
React + Vite (official `react` template), plain CSS, localStorage. No backend, no API keys.
