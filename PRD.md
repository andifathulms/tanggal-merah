# PRD — Tanggal Merah

**The year's holidays, and where to spend your leave to get the longest stretches off. With the rule that most people get wrong made explicit: whether cuti bersama costs you a day.**

| | |
|---|---|
| **Status** | Draft — pre-implementation |
| **Owner** | Andi Fathul Mukminin Salahuddin |
| **Type** | Personal portfolio project, open source, public utility |
| **Deployment** | GitHub Pages (static export, no server, no runtime network) |
| **Language** | Indonesian-first UI; English secondary |
| **Sibling** | Rinci. Cited rule packs, refuse-rather-than-guess, contradiction ledger. |

*Name: the term people actually search. English alternative: **Holiday Planner**.*

---

## 1. Why this isn't trivial

The list of holidays is easy. Two things aren't.

**Cuti bersama is not free, and the rules differ by who you are.** The SKB that sets them states in its fourth diktum that cuti bersama reduces the annual leave entitlement of employees, and in its sixth that for private institutions implementation is decided by each management. So for a private-sector worker, cuti bersama is *optional and costly*: <cite index="14-1">it is fakultatif, the company decides whether to close, and if it doesn't you work normally with no leave deducted.</cite> Meanwhile <cite index="14-1">a separate Keppres provides that for ASN it does not cut annual leave, and that an ASN who cannot take cuti bersama because of their post has their annual leave increased by the number of days not given.</cite>

The practical consequence for 2026: <cite index="19-1">eight cuti bersama days are set, so a private-sector worker whose company takes all of them and deducts all of them is left with four of their twelve days.</cite> Most people discover this in November.

**The sources disagree, publicly.** Reporting on the 2026 SKB includes at least one outlet stating <cite index="12-1">that cuti bersama reduces annual leave for ASN while for private institutions the policy is left to each management</cite> — which reverses the assignment every other source gives. That is not a small slip; it is the exact fact a reader needs.

So this app does what Rinci does: cite each rule to its instrument, and **record the disagreement rather than silently picking a side**.

## 2. Holidays are decreed, not computed

An important architectural consequence. Idul Fitri, Nyepi, Waisak, and Imlek all have underlying astronomical or calendrical determinations — but **the official holiday is whatever the SKB says**, and the SKB itself notes that the dates of 1 Ramadan, Idulfitri, and Iduladha are set separately by Kemenag.

**The app therefore ships SKB data per year and never computes a religious date.** A year with no published SKB returns a structured refusal, not a projection. Computing would eventually disagree with the government, and being confidently wrong about whether someone has a day off is the whole failure mode here.

## 3. The optimisation

Given a leave budget, which days bought give the longest runs off?

Each candidate leave day is a **bridge** — a workday sitting between two blocks of days off. Spending one workday between a holiday and a weekend joins them into a four-day stretch.

The metric is **leverage**: the length of the stretch produced, divided by the leave days spent. Note what it is *not* — days off gained per day spent is 1.0 for every bridge, always, because buying the workdays in a gap gains exactly those days and the blocks either side were already off. A bridge does not buy more days off. It buys **contiguity**, and leverage measures how much stretch each leave day is converted into. The UI must say this rather than say "gained", which is a false description of the number.

It's a small, exactly-solvable problem — enumerate the gaps between fixed off-blocks, cost is the workdays in the gap, benefit is the days joined, then select under budget. Brute-forceable at realistic sizes, so the optimum is provable rather than heuristic.

And it depends entirely on §1: for a private-sector worker whose company deducts cuti bersama, those days are already spent, and the budget available for bridging is what remains.

## 4. Non-goals

- **No accounts, no calendar sync, no server.** ICS export lets the user's own calendar do that.
- **No company leave policies or HR integration.** Company policy is an input the user states, never something the app knows.
- **No computed religious dates.** See §2.
- **No advice.** It computes options; it never tells anyone to take leave or when.
- **No regional or company-specific holidays in v1.** Regional election days and local holidays are real; they enter as user-added days, not as claimed data.
- **No multi-person or team leave coordination.** Different product.

## 5. Features

### 5.1 The year sheet — signature view
Twelve months at a glance, in the layout of an Indonesian wall calendar. Libur nasional in red, cuti bersama distinguished from it, weekends shaded, your chosen leave days marked.

**Runs of consecutive days off draw as a continuous bar across the grid.** That connection is the whole insight — a bridge day isn't one red square, it's the thing that joins two blocks into one stretch. Toggling a day and watching the bar snap together is the moment the app earns its existence.

### 5.2 Employment status — a first-class input, not a setting
ASN or private sector, and if private, whether the company takes and deducts cuti bersama. This changes the arithmetic more than anything else, so it's asked up front and shown in the result. Each branch cites its instrument.

### 5.3 Work pattern
Five-day or six-day working week. Many Indonesians still work Saturdays, and every long-weekend calculation changes if you do. Most planners assume five days silently.

### 5.4 The suggestion
Given the remaining budget, the highest-leverage bridges, ranked. Each shows the days spent, the stretch produced, and the leverage figure — *"1 day → 4 days off"* — with the arithmetic visible.

### 5.5 The ledger
Days accounted for: entitlement, cuti bersama deducted (or not, with the reason and citation), bridges spent, remaining. The cuti bersama contradiction gets an entry here, with both readings, their sources, and which the app uses.

### 5.6 Export
**ICS** for holidays and chosen leave, so it lands in a real calendar. **PNG of the year sheet**, which is the shareable artefact and the distribution mechanism — this gets posted in group chats every December.

### 5.7 Sharing
Year, status, work pattern, and chosen days encode into the URL hash.

## 6. Architecture

Static Next.js 14 App Router export. No backend, no runtime network.

```
year + status + work pattern + budget
  → rule resolver   → which days are off, and what each costs
  → run computation → consecutive-off blocks
  → optimiser       → ranked bridges under budget
  → LeaveTrace      → sheet | suggestions | ledger
```

**SKB data is cited rule-pack data**, one file per year, each holiday carrying its date, type (libur nasional or cuti bersama), name, and the SKB number and signing date it comes from. The build fails on an uncited entry.

**The engine is pure.** `(year, rules, status, pattern, budget) → LeaveTrace`. No `Date` objects in the core — dates are integer day numbers, no timezones, no DST. No clock; "this year" is resolved in the UI.

**Refuse rather than project.** No SKB for the requested year returns a structured refusal naming the gap.

**The optimiser is exact.** Brute-force verified; it reports the true optimum, not a greedy approximation.

## 7. Testing

**Brute-force oracle.** For realistic budgets the full search is cheap, so the optimiser's answer is provably optimal, asserted against exhaustive enumeration.

**Run computation** matches a naive day-by-day scan across the full year, under both work patterns.

**Properties:** more budget never yields a worse best result; leverage is always at least 1; a suggested bridge always joins blocks that were separate without it.

**Rule-pack integrity at build time:** every day cited to an SKB with its number and date; no computed religious dates; no gaps or duplicates in a year's dates.

**Status branch fixtures**, both directions: ASN's entitlement is not reduced by cuti bersama; private-sector-with-deduction is, and the resulting budget differs by exactly the cuti bersama count.

**Refusal coverage:** unpublished year refuses; published year computes.

**Determinism.**

## 8. Design direction

The object is the **kalender dinding** — the wall calendar in every Indonesian home and office, with its red Sundays and red holidays. *Tanggal merah* is literally "red date", so red isn't a reserved accent here; **it's the subject**, and the design should let it be loud.

**Palette.** Newsprint `#EFEDE6`. Ink `#1C1B18`. **Libur merah `#C62828`** — the hero, used at full strength for national holidays. **Cuti bersama amber `#D98324`**, distinct because it is a different thing with a different cost, and conflating the two is the app's central correction. **Leave green `#3D7A5A`** for days you choose. Weekend wash `#E3E0D6`, recessive. Run bar in a translucent red that reads over all of them.

**Type.** **Bebas Neue** for month headers and the big date numerals — the poster-condensed register of a printed calendar, unmistakable and free of the dashboard look. **Manrope** for prose and controls. **Overpass Mono** with tabular figures for counts and leverage readouts.

**Structure.** Twelve month blocks on a grid, dense, with the calendar's own conventions — week starts on Sunday, dates right-aligned in their cells, holiday names in small print beneath the number as they are on a real calendar. The ledger sits as a printed panel, the way a wall calendar carries its list of holidays down one side.

**Motion.** One moment: toggling a leave day, and the run bar extending to join two blocks. Nothing else animates.

**Copy.** Indonesian first, in the terms people use — *tanggal merah*, *libur nasional*, *cuti bersama*, *cuti tahunan*, *harpitnas*. The status branch is stated plainly: *"Kalau perusahaan Anda ikut cuti bersama dan memotong cuti tahunan, sisa cuti Anda tinggal segini."*

## 9. Milestones

| | | |
|---|---|---|
| **M0** | Rules | Scaffold, SKB schema and validator, current year's data cited. |
| **M1** | Engine | Day model, work patterns, run computation, optimiser, brute-force oracle. Console only. |
| **M2** | The sheet | Year view, holidays, runs, status input, ledger. **Ship publicly here.** |
| **M3** | Planning | Budget, ranked suggestions, leverage, toggling. |
| **M4** | Export | ICS, PNG of the sheet, sharing. **This is the distribution mechanism.** |
| **M5** | Depth | Multi-year, contradiction ledger page, user-added regional days, a11y. |

Small project. M2 is publishable and M4 is what makes it spread.

## 10. Success criteria

- Optimiser provably optimal against brute force at realistic budgets.
- Every holiday cited to its SKB number and signing date, enforced by the build.
- No religious date computed anywhere.
- Both status branches produce the correct entitlement, asserted in both directions.
- Unpublished years refuse rather than project.
- ICS imports cleanly into Google Calendar and Apple Calendar.
- PNG export is legible at chat-thumbnail size.
- Fully offline after first load. JS ≤ 150 KB gzipped.

## 11. Deployment

`output: 'export'`, `basePath` matching the repository name, `.nojekyll` in the output root. Rule validation gates the deploy. Fonts self-hosted via `next/font`. Verify under the production `basePath` with `pnpm preview` before pushing.

## 12. Risks

| Risk | Mitigation |
|---|---|
| **Getting the cuti bersama rule backwards.** | Both readings recorded in the contradiction ledger with sources; the app's choice cited to the instrument rather than to reporting. Fixtures in both directions. |
| **A new SKB lands and the app is stale.** | Per-year data with the SKB number and date visible on the page; a warning when the current year has no pack; an `UPDATING.md` written for a stranger. |
| **Computing a religious date and disagreeing with the government.** | Never compute. Refuse for unpublished years. |
| **Reading as employment-law advice.** | States that company policy governs, that it is a personal project, and that the user should confirm with HR. |
| **Regional holidays claimed but wrong.** | Not shipped as data. User-added only. |
