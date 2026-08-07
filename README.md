# BuddyContact

Never lose touch. BuddyContact isn't just an address book — it tracks _when_
you last talked to someone and _when you're overdue_ to reach out, so
relationships (personal or professional) don't quietly go cold.

## Features

- **Follow-up tracking**: set a reminder cadence per contact (weekly,
  monthly, custom) and see who's overdue or due soon on a dedicated "Due for
  follow-up" view — the app's home screen
- **Log Contact**: one click logs that you reached out and resets the clock;
  optionally attach a note
- **Interaction timeline**: every logged contact builds a dated history on
  that person's page — what you talked about, and when
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

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)       |
| Language   | TypeScript                                          |
| Database   | SQLite / [libSQL](https://turso.tech) via Prisma    |
| ORM        | [Prisma](https://www.prisma.io) 7 (driver adapters) |
| Validation | [Zod](https://zod.dev)                              |
| Styling    | [Tailwind CSS](https://tailwindcss.com)             |
| Testing    | [Vitest](https://vitest.dev) + Testing Library      |

libSQL was chosen over plain SQLite so the same schema and client code work
unchanged in both a local file-based dev database and a hosted, serverless
production database (e.g. [Turso](https://turso.tech)) — no provider swap
needed at deploy time.

## How follow-up status is computed

Each contact with a reminder cadence gets a due date: `lastContactedAt` (or
`createdAt`, if never contacted) + `cadenceDays`. That maps to a status:

- **Overdue** — past the due date
- **Due soon** — due within 3 days
- **On track** — due later than that
- **No reminder** — no cadence set

See `src/lib/followup.ts` (pure functions, fully unit tested).

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
    page.tsx                    Home: "Due for follow-up" + full contact list
    contacts/[id]/page.tsx       Contact detail: Log Contact form + interaction timeline
    actions.ts                   Server actions (create/update/delete/favorite/logInteraction)
    api/contacts/                REST: GET/POST /api/contacts, GET/PATCH/DELETE /api/contacts/[id]
    api/contacts/[id]/interactions/  REST: GET/POST interaction history
    api/tags/                    GET /api/tags
  components/
    ContactForm, ContactCard, ContactList, SearchBar, AddContactPanel,
    FollowUpBadge, LogInteractionForm, InteractionTimeline
  lib/
    prisma.ts                    Prisma client singleton (libSQL adapter)
    validation.ts                 Zod schemas for create vs. partial update
    followup.ts                   Follow-up status logic + relative-time formatting
prisma/
  schema.prisma                  Contact / Tag / Interaction models
  seed.ts                        Sample data with follow-up history
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
{ "note": "Caught up over coffee" }
```

`note` is optional — omit it to just log that contact happened.

## Testing

```bash
npm test
```

Covers: follow-up status logic (overdue/due-soon/on-track boundaries,
urgency sorting, relative-time formatting), Zod validation (including the
create-vs-update default-value distinction for both `favorite`/`tags` and
`cadenceDays`), and component behavior (favorite toggling, delete
confirmation, edit-mode switching, logging a contact, form submission and
error display) via Vitest and React Testing Library.

## Deployment

This app is designed to deploy to [Vercel](https://vercel.com) with a hosted
[Turso](https://turso.tech) (libSQL) database:

1. Create a Turso database and auth token.
2. In Vercel, set the `DATABASE_URL` (`libsql://...`) and
   `DATABASE_AUTH_TOKEN` environment variables.
3. Run `npx prisma migrate deploy` against the production database (e.g. via
   a Vercel deploy hook or manually) before the first deploy.
4. Import the repo into Vercel and deploy — no other config needed.

## License

MIT — see [LICENSE](LICENSE).
