# BuddyContact

Never lose touch. BuddyContact isn't just an address book — it tracks _when_
you last talked to someone and _when you're overdue_ to reach out, so
relationships (personal or professional) don't quietly go cold.

## Features

- **Follow-up tracking**: set a reminder cadence per contact (weekly,
  monthly, custom) and see who's overdue or due soon on a dedicated "Due for
  follow-up" view — the app's home screen
- **Log Contact**: one click logs that you reached out and resets the clock;
  optionally attach a note and the channel you used (call, text, email,
  chat/DM, social, in person)
- **Voice dictation**: dictate the note instead of typing it, via the
  browser's built-in Web Speech API — no server round-trip, free
- **AI topic suggestions**: on a contact's page, generate 2–3 conversation
  topics grounded in their actual interaction history (Claude Opus 5) —
  user-triggered, not automatic, to keep it cheap and non-intrusive
- **Snooze**: defer a reminder ("not now, ask me in a week") instead of
  either acting on it or having it nag forever
- **Triage mode** (`/triage`): review everyone who's due one at a time —
  log, snooze, or skip — instead of scrolling a list
- **Quick Log**: log an interaction with anyone from anywhere in the app,
  without navigating to their page first
- **Weekly recap**: "you reconnected with N people this week," plus a
  streak counter that tolerates one missed week per break instead of
  resetting to zero — encouragement without the anxiety of an unforgiving
  streak
- **Interaction timeline**: every logged contact builds a dated, channel-
  tagged history on that person's page — what you talked about, how, and
  when
- Full CRUD for contacts: name, email, phone, company, tags, favorites
- Tagging with multi-tag filtering (e.g. `friend`, `work`, `client`)
- Debounced search across name, email, and company
- Server-rendered list with URL-based search/filter state (shareable, works
  without JavaScript for the initial render)
- A documented REST API (`/api/contacts`, `/api/contacts/:id/interactions`,
  `/api/tags`) in addition to the server-action-driven UI
- Input validation on both the client and server (Zod)
- Reviewed against the [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines):
  labeled inputs, visible focus states, `aria-live` on async updates, debounced
  search, semantic markup
- Route-level loading skeletons, a branded 404, and an error boundary —
  no blank screens or default framework pages
- Programmatically generated favicon/app icon and OpenGraph metadata for
  link previews

## Tech stack

| Layer      | Choice                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)                                                      |
| Language   | TypeScript                                                                                         |
| Database   | SQLite / [libSQL](https://turso.tech) via Prisma                                                   |
| ORM        | [Prisma](https://www.prisma.io) 7 (driver adapters)                                                |
| Validation | [Zod](https://zod.dev)                                                                             |
| Styling    | [Tailwind CSS](https://tailwindcss.com)                                                            |
| Testing    | [Vitest](https://vitest.dev) + Testing Library                                                     |
| AI         | [Claude API](https://platform.claude.com) (`@anthropic-ai/sdk`), Claude Opus 5, structured outputs |
| Voice      | Web Speech API (browser-native — no external service)                                              |

libSQL was chosen over plain SQLite so the same schema and client code work
unchanged in both a local file-based dev database and a hosted, serverless
production database (e.g. [Turso](https://turso.tech)) — no provider swap
needed at deploy time.

## How follow-up status is computed

Each contact with a reminder cadence gets a due date: `lastContactedAt` (or
`createdAt`, if never contacted) + `cadenceDays`. That maps to a status:

- **Snoozed** — explicitly deferred, checked before anything else
- **Overdue** — past the due date
- **Due soon** — due within 3 days
- **On track** — due later than that
- **No reminder** — no cadence set

See `src/lib/followup.ts` (pure functions, fully unit tested) — also home to
the weekly-recap/streak calculation (`getWeeklyRecap`), which tolerates
exactly one missed week per streak rather than resetting on the first gap.
This follows research on
[ethical gamification](https://www.gamificationhub.org/ethical-gamification-principles/)
(Duolingo's streak-freeze mechanic is the reference point): an unforgiving
streak creates anxiety without improving the underlying behavior it's meant
to encourage.

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/littbarskiadeh/buddycontact.git
cd buddycontact
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed   # optional: adds sample contacts with follow-up history
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Everything works with just the steps above. AI topic suggestions are the
one feature that needs more: set `ANTHROPIC_API_KEY` in `.env` (a key from
[console.anthropic.com](https://console.anthropic.com)) — without it, that
one button shows a clear "unavailable" message instead of the app crashing.
Voice dictation needs nothing extra; it just doesn't appear in browsers
without Web Speech API support (Firefox, notably).

### Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the dev server                     |
| `npm run build`        | Production build                         |
| `npm run start`        | Run the production build                 |
| `npm run lint`         | ESLint                                   |
| `npm run typecheck`    | Generate Next.js route types, then `tsc` |
| `npm run format`       | Format with Prettier                     |
| `npm run format:check` | Check formatting without writing         |
| `npm test`             | Run the test suite once                  |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run db:migrate`   | Apply Prisma migrations (dev)            |
| `npm run db:seed`      | Seed the database with sample contacts   |
| `npm run db:studio`    | Open Prisma Studio (visual DB browser)   |

## Project structure

```
src/
  app/
    page.tsx                    Home: weekly recap + "Due for follow-up" + full contact list
    triage/page.tsx              One-contact-at-a-time review of everyone due (force-dynamic)
    contacts/[id]/page.tsx       Contact detail: topic suggestions, Log Contact form, timeline
    actions.ts                   Server actions (create/update/delete/favorite/logInteraction/snooze)
    ai-actions.ts                 Claude API call for topic suggestions (isolated — the one paid dependency)
    api/contacts/                REST: GET/POST /api/contacts, GET/PATCH/DELETE /api/contacts/[id]
    api/contacts/[id]/interactions/  REST: GET/POST interaction history
    api/tags/                    GET /api/tags
  components/
    ContactForm, ContactCard, ContactList, SearchBar, AddContactPanel,
    FollowUpBadge, LogInteractionForm, InteractionTimeline, TopicSuggestions,
    SnoozeSelect, ContactSnoozeControl, QuickLogButton, TriageFlow, WeeklyRecap
  lib/
    prisma.ts                    Prisma client singleton (libSQL adapter)
    validation.ts                 Zod schemas for create vs. partial update
    followup.ts                   Follow-up status, weekly recap/streak, relative-time formatting
    due-contacts.ts               Shared due-contacts query (home page + triage)
    channels.ts                   Interaction channel constants (call/text/email/chat/social/...)
    useSpeechDictation.ts         Web Speech API hook (SSR-safe feature detection)
prisma/
  schema.prisma                  Contact / Tag / Interaction models
  seed.ts                        Sample data with follow-up + channel + snooze history
```

## API reference

All endpoints return JSON.

| Method | Path                             | Description                                      |
| ------ | -------------------------------- | ------------------------------------------------ |
| GET    | `/api/contacts`                  | List contacts. Query params: `q` (search), `tag` |
| POST   | `/api/contacts`                  | Create a contact                                 |
| GET    | `/api/contacts/:id`              | Get one contact                                  |
| PATCH  | `/api/contacts/:id`              | Partially update a contact                       |
| DELETE | `/api/contacts/:id`              | Delete a contact                                 |
| GET    | `/api/contacts/:id/interactions` | List a contact's interaction history             |
| POST   | `/api/contacts/:id/interactions` | Log an interaction (also sets `lastContactedAt`) |
| GET    | `/api/tags`                      | List all tags                                    |

`POST`/`PATCH` body for `/api/contacts`:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "555-0100",
  "company": "Analytical Engines Ltd",
  "favorite": true,
  "tags": ["mentor", "tech"],
  "cadenceDays": 14
}
```

`cadenceDays` is nullable — `14` sets a reminder every 14 days, `null`
explicitly clears it. `PATCH` is a true partial update: omitted fields are
left unchanged rather than reset to their defaults (this includes
`cadenceDays` — a field _present_ with value `null` clears it, a field
_absent_ from the body leaves it alone).

`POST` body for `/api/contacts/:id/interactions`:

```json
{ "note": "Caught up over coffee", "channel": "call" }
```

Both fields are optional — omit them to just log that contact happened.
`channel` is one of `call`, `text`, `email`, `chat`, `social`, `in_person`,
`other` (see `src/lib/channels.ts`).

Snoozing and AI topic suggestions are server actions only (`snoozeContact`,
`unsnoozeContact`, `getTopicSuggestions` in `src/app/actions.ts` /
`ai-actions.ts`) — not exposed as REST endpoints, since they're invoked
exclusively from the UI.

## Testing

```bash
npm test
```

Covers: follow-up status logic (overdue/due-soon/on-track/snoozed
boundaries, urgency sorting, relative-time formatting), the weekly-recap and
streak-with-grace calculation, Zod validation (including the
create-vs-update default-value distinction for `favorite`/`tags`/
`cadenceDays`, and the interaction channel enum), and component behavior
(favorite toggling, snoozing, delete confirmation, edit-mode switching,
logging a contact, form submission and error display) via Vitest and React
Testing Library. `getTopicSuggestions` (the one call that hits the Claude
API) is exercised directly against a database with no `ANTHROPIC_API_KEY`
set, asserting it fails with a clear message rather than throwing — the AI
response itself isn't covered by an automated test, since that would either
require a live API key in CI or mocking away the exact thing worth testing.

## Deployment

This app is designed to deploy to [Vercel](https://vercel.com) with a hosted
[Turso](https://turso.tech) (libSQL) database:

1. Create a Turso database and auth token.
2. In Vercel, set the `DATABASE_URL` (`libsql://...`), `DATABASE_AUTH_TOKEN`,
   and (optionally, for AI topic suggestions) `ANTHROPIC_API_KEY`
   environment variables.
3. Run `npx prisma migrate deploy` against the production database (e.g. via
   a Vercel deploy hook or manually) before the first deploy.
4. Import the repo into Vercel and deploy — no other config needed.

## License

MIT — see [LICENSE](LICENSE).
