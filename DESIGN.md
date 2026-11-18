# DESIGN.md — ET 617 End-Sem · 24B0748

## Identity card
| Field | Choice |
|---|---|
| ID | 24B0748 |
| P | P4 – Adaptive tutor with automatic question generation |
| T | P4-T1 – Integers: operations with negative numbers (Class 7) |
| L | L5 – Learner repeating the topic after failing it once; high anxiety, low self-efficacy |
| C | C5 – Teacher-in-the-loop (teacher view shows progress; approve/override automated feedback) |

App name: **Number Line Buddy** · Live: `et617-24b0748.vercel.app`

## D1 · Educational problem
Many Class 7 learners fail the integers unit not because they cannot add, but because they carry over half-remembered sign rules ("two minuses make a plus") into the wrong operation. A learner who has already failed once now expects to fail again, so they guess quickly, avoid explaining and stop asking for help. Routine worksheets give the same items to everyone and only mark right/wrong, so the actual misconception is never surfaced or fixed. The tutor must find *which* rule the learner is misapplying, repair it with the number line, and build confidence through small wins — while a teacher keeps control over the automated feedback.

**Learning outcomes** (measurable):
1. **Compute** sums and differences of integers, including two negatives and subtracting a negative, with ≥ 80 % accuracy on mixed items.
2. **Explain**, using a number-line movement, why 5 − (−3) = 8 and why (−3) + (−5) = −8.
3. **Predict** the sign of a sum or difference before calculating, and justify the prediction.

**Context of use:** at home in the evening, 15–20 min, on a parent's Android phone (Chrome), Marathi/English medium; the class teacher reviews progress on the school laptop/phone next morning.

## D2 · Learner persona
**Riya Pawar**, 13, Class 7, Pune Municipal school (semi-English medium; speaks Marathi at home).
- **Prior knowledge:** fluent with whole-number addition/subtraction; knows negative numbers exist (temperature, "minus"); can place positive numbers on a number line; shaky on ordering negatives.
- **History:** failed the integers unit test (9/25). Now repeating the unit; tells herself "I'm just bad at maths".
- **Misconception M1 – "two negatives make a positive" in addition:** (−3) + (−5) = **+8**.
- **Misconception M2 – ignoring the sign of the subtracted number:** 5 − (−3) = **2** (treats it as 5 − 3).
- (Secondary, diagnostic only) M3 – ordering by digit size: −7 > −2.
- **Device/time:** mother's Android phone, ~20 min after 8 pm; no headphones; data pack shared.
- **Language:** reads simple English; Marathi words help ("vajabaki" = subtraction, "berij" = addition).
- **Motivation:** wants to pass the re-test without being embarrassed; responds to private, low-stakes practice and visible progress; shuts down after 2–3 red crosses.

## D3 · Content plan
**Concept explanation:** "Think of the number line as a road. Adding a positive = walk right. Adding a negative = walk left. Subtracting = turn around first, then walk." Worked examples on an animated number line.

**Question formats (≥3):**
1. **Numeric answer** — e.g. (−3) + (−5) = ?
2. **Number-line tap** — tap where you land: start at 5, subtract (−3).
3. **Multiple choice with diagnostic distractors** — each wrong option maps to M1/M2/M3.
4. **Spot the error + explain** — "Aarav says (−4) + (−2) = 6. Is he right? Explain in one line." (free text, rule-checked).
5. **Predict the sign** — will 7 + (−10) be positive or negative? Why?

Questions are **generated** from templates × learner state (level, current misconception), not a fixed bank.

**Feedback (examples):**
- Correct: "Yes! Start at −3, walk 5 steps left → −8. You moved left both times, so the answer stays negative."
- M1: "You got +8. The 'two minuses make a plus' rule is for *multiplying*, not adding. Let's walk it: start at −3, adding −5 means 5 steps **left**… where do you land?"
- M2: "You got 2 — you treated it as 5 − 3. Subtracting means *turn around*. −3 points left, turn around → walk 3 **right** from 5. Where do you land?"

## Adaptive decision rule (design challenge)
After every answer the tutor classifies the response and picks one of three moves:
| Condition | Move |
|---|---|
| Correct (and explanation passes check, if asked) **2 in a row** at this level | **Harder question** (level up: bigger numbers → mixed ops → spot-the-error) |
| Wrong **and** the answer matches a known misconception (M1/M2/M3 predicted wrong answer) | **Alternative explanation** targeted at that misconception (number-line walk-through), then a similar generated item |
| Wrong and **unrecognised**, OR the same misconception appears again right after its alternative explanation | **Prerequisite instruction** (opposites & ordering on the number line), then restart at an easier level |

Profile adaptivity: a 3-item diagnostic + confidence check sets the start level. Interaction adaptivity: hint requests and response time are logged; 2 hints in a row → offer the number line by default.

## C5 · Teacher-in-the-loop
Teacher view (PIN screen) shows: per-skill mastery, misconception counts, attempt log, and a **review queue** of automated feedback on free-text explanations with **Approve / Override** (edit message). Overridden feedback appears to the learner with a "Your teacher reviewed this" badge.

## Screens (planned)
1. Welcome / About · 2. Diagnostic (3 items + confidence) · 3. Learn (number-line explanation) · 4. Practice (adaptive question) · 5. Feedback (correct / alternative explanation) · 6. Prerequisite mini-lesson · 7. Session summary · 8. Teacher view. Footer with **24B0748** on every screen.

## Stack
React + Vite (official `react` template), plain CSS, localStorage. No backend, no API keys.
