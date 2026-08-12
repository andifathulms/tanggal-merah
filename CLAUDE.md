# CLAUDE.md — Tanggal Merah

Indonesian holiday and leave planner. Cited SKB data per year, exact bridge optimisation, and the cuti bersama entitlement rule made explicit by employment status. Static site, GitHub Pages, no backend, no runtime network.

Read `PRD.md` before starting any task — **§1 and §2 in particular**. It fixes scope; this file describes how to work in the repo.

**Four things shape everything:**

1. **Never compute a religious date.** Idul Fitri, Nyepi, Waisak, Imlek — the *official holiday* is whatever the SKB says, and the SKB itself defers 1 Ramadan, Idulfitri, and Iduladha to a separate Kemenag decision. Computing would eventually disagree with the government about whether someone has a day off.
2. **The cuti bersama rule differs by employment status, and published sources contradict each other on it.** Cite to the instrument, not to reporting, and record the disagreement in the ledger.
3. **Cuti bersama and libur nasional are different things with different costs.** Never merge them into one "holiday" type. The distinction is the app's central correction.
4. **Refuse rather than project.** A year with no published SKB gets a structured refusal, never an extrapolated calendar.

**Sibling project:** Rinci. Same cited-rule-pack architecture and contradiction ledger. Follow those patterns.

---

## Stack

- Next.js 14, App Router, `output: 'export'` — static only
- TypeScript, `strict: true`
- Tailwind CSS
- Zod for rule-pack validation
- Vitest
- pnpm
- **No date library.** Days are integers. No calendar or holiday package — the data is the point.
- Fonts via `next/font`, self-hosted.

## Commands

```bash
pnpm dev
pnpm build                  # static export to ./out; runs rules:validate first
pnpm preview                # serve ./out under the production basePath
pnpm test                   # vitest watch
pnpm test:run               # vitest once — before every commit
pnpm test:optimiser         # brute-force agreement + properties
pnpm test:status            # ASN vs private branch fixtures, both directions
pnpm rules:validate         # SKB citations, date continuity, no computed dates
pnpm typecheck
pnpm lint
```

`pnpm rules:validate` gates the build and CI.

## Layout

```
app/
  [locale]/                 # id (default), en
    tahun/                  # the year sheet
    rencana/                # budget + suggestions
    aturan/                 # ledger, citations, contradiction entry
components/
  sheet/                    # twelve-month grid, run bars
  ledger/                   # entitlement accounting
  suggest/                  # ranked bridges
lib/
  day/                      # integer day numbers, week arithmetic. No Date.
  rules/                    # schema, loader, resolver, validator
  status/                   # ASN vs private entitlement branches
  runs/                     # consecutive-off block computation
  optimise/                 # bridge enumeration + exact selection
    brute.ts                # exhaustive oracle — TESTS ONLY
  trace/                    # LeaveTrace types
  export/                   # ICS + PNG
data/
  skb/                      # one file per year: dates, types, SKB number, signed date
  contradictions/           # cuti bersama entitlement readings + sources
tests/
  optimiser/
  status/
  runs/
  refusal/
```

## Invariants

1. **No `Date` objects in `lib/`.** Days are integer day numbers; week position is arithmetic. No timezones, no DST, no locale. The UI converts at the boundary.

2. **The engine never reads the clock.** The year is always an explicit argument. "This year" is resolved in the UI and passed in.

3. **No holiday date is computed.** Every date in `data/skb/` is transcribed from a published SKB with its number and signing date. **No astronomical calculation, no Hijri conversion, no Balinese calendar arithmetic anywhere in the codebase.**

4. **`libur nasional` and `cuti bersama` are distinct types**, in the data model, the engine, and the UI. Never collapse them into a shared "holiday" enum member. They cost different things.

5. **Entitlement branches by employment status, and each branch cites its instrument.** ASN and private-sector-with-deduction and private-sector-without are three outcomes, not a boolean. `status/` holds them; nothing else branches on status.

6. **Every SKB entry carries its number, signing date, and holiday type.** Validator-enforced; the build rejects an uncited entry.

7. **Refuse rather than project.** No pack for the requested year returns a structured refusal naming the gap. Never extrapolate from the previous year, never fall back to fixed-date holidays only.

8. **The optimiser is exact, not greedy.** It reports the true optimum for the budget, verified against `brute.ts`. If a heuristic is ever needed for performance, it must be labelled as such in the output — but at realistic budgets it is not needed.

9. **`brute.ts` is never imported outside tests.**

10. **Work pattern is a first-class input.** Five-day and six-day weeks both supported. Never assume Saturday is off.

11. **Company policy is user-stated, never assumed.** The app does not know whether a company takes cuti bersama; it asks.

12. **Where sources disagree, add a contradiction entry.** Do not silently pick. `data/contradictions/` records the competing readings, their sources and dates, the value used, and why.

13. **No advice.** The app computes options. It never recommends taking leave, never says a plan is good, never ranks by anything but leverage arithmetic.

14. **Red is the subject, not a reserved accent.** Libur merah at full strength for national holidays; cuti bersama in amber because it is a different thing; leave green for user choices. See PRD §8.

15. **Nothing is computed in a component.**

## Working style

- **Rule pack before engine.** Transcribe and cite the SKB, validate it, then compute against it.
- **Write `brute.ts` before the optimiser.** It is twenty lines and it is what makes "optimal" a claim rather than a hope.
- **Cite to the instrument, never to reporting.** News coverage of the SKB has already got the ASN/private assignment backwards at least once. Read the SKB and the Keppres; put the number in the comment.
- **When you find a disagreement, file it in the ledger** — that entry is more useful to a reader than the answer alone.
- **Keep it small.** This is a modest project and the spec is proportionate. Resist adding features that need a backend.
- **Don't touch `next.config.js`, the Actions workflow, or the validator without saying so explicitly.**
- **Don't add a date, calendar, or holiday dependency.**
- **Never weaken a test or the validator to make something pass.**

## Conventions

- Named exports; defaults only where Next requires them.
- Discriminated unions for day types, statuses, and results, keyed on `type`. Exhaustive `switch` with a `never` default — this is how adding a day type surfaces every site that must handle it.
- No `any`. No non-null `!` in `lib/`.
- Days as integers named `*Day`; counts named `*Days`. Never mix a day number with a day count.
- Indonesian vocabulary in identifiers and UI: `liburNasional`, `cutiBersama`, `cutiTahunan`, `hariKerja`, `tanggalMerah`. Do not substitute English approximations.
- Comments cite the SKB or Keppres number for any rule they implement.
- Tabular numerals on every count and leverage figure.
- Tailwind utilities inline; semantic tokens in `tailwind.config.ts` — `newsprint`, `ink`, `liburMerah`, `cutiBersama`, `cutiPribadi`, `akhirPekan`. Never raw hex in components.

## Testing rules

- `pnpm test:run` before every commit; `pnpm test:optimiser` and `pnpm test:status` before any commit touching `lib/optimise`, `lib/status`, or `lib/runs`.
- Optimiser asserted against brute force at every realistic budget.
- Properties asserted broadly: more budget never yields a worse result; leverage always ≥ 1; every suggested bridge genuinely joins blocks that were separate without it.
- Run computation asserted against a naive day-by-day scan, under both work patterns.
- Status fixtures run in both directions: ASN entitlement unreduced by cuti bersama; private-with-deduction reduced by exactly the cuti bersama count.
- Refusals asserted in both directions: unpublished year refuses, published year computes.
- New SKB year → citation present, no duplicate or missing dates, both day types represented correctly.
- ICS output validated against a parser; PNG export asserted to render at thumbnail size.
- Bug fix → failing test first.

## Deployment

`main` builds and deploys via Actions; rule validation gates it. `basePath` must match the repository name; `.nojekyll` must exist in `out/`. Verify with `pnpm preview` before pushing.

## Framing

The site states plainly that it is a personal project, not employment-law advice, that company policy governs cuti bersama in the private sector, and that the user should confirm with HR. Every holiday shows the SKB it came from. No OIKN or government branding anywhere.

## Current state

M0–M4 built. Rule pack, validator, day model, run computation, exact optimiser with its brute-force oracle, status branches, the year sheet, the ledger, ranked suggestions, ICS and PNG export, URL-hash sharing, and the Pages workflow are all in place. 78 tests.

**The one thing blocking a public ship: `data/skb/2026.json` is `perluVerifikasi`.** The dates were transcribed from the widely circulated 2026 calendar, but the SKB and Keppres numbers were never checked against the published documents, so they are recorded as `BELUM DIVERIFIKASI` rather than invented. The app carries a banner while that holds. `UPDATING.md` lists what to check off; when it is done, set `status` to `terverifikasi` and the validator will reject any placeholder left behind.

Next: verify the 2026 pack against the instruments, then M5 — multi-year packs, user-added regional days, a11y.

One addition to the layout above: `lib/sheet/` holds the grid arithmetic and run-bar geometry, because invariant 15 means a component cannot work out which cell a date lands in either.
