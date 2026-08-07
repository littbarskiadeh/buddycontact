# BuddyContact

A simple, fast personal contact management app. Add contacts, tag and search
them, and mark favorites — built as a small, well-tested full-stack reference
project.

## Features

- Full CRUD for contacts: name, email, phone, company, notes
- Tagging with multi-tag filtering (e.g. `friend`, `work`, `client`)
- Full-text-style search across name, email, and company
- Favorites
- Server-rendered list with URL-based search/filter state (shareable, works
  without JavaScript for the initial render)
- A documented REST API (`/api/contacts`, `/api/tags`) in addition to the
  server-action-driven UI, for programmatic access
- Input validation on both the client and server (Zod)

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
npm run db:seed   # optional: adds 3 sample contacts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start the dev server                   |
| `npm run build`        | Production build                       |
| `npm run start`        | Run the production build               |
| `npm run lint`         | ESLint                                 |
| `npm run typecheck`    | TypeScript, no emit                    |
| `npm run format`       | Format with Prettier                   |
| `npm run format:check` | Check formatting without writing       |
| `npm test`             | Run the test suite once                |
| `npm run test:watch`   | Run tests in watch mode                |
| `npm run db:migrate`   | Apply Prisma migrations (dev)          |
| `npm run db:seed`      | Seed the database with sample contacts |
| `npm run db:studio`    | Open Prisma Studio (visual DB browser) |

## Project structure

```
src/
  app/
    page.tsx           Server-rendered contact list (reads searchParams)
    actions.ts          Server actions used by the UI (create/update/delete/favorite)
    api/contacts/       REST endpoints: GET/POST /api/contacts, GET/PATCH/DELETE /api/contacts/[id]
    api/tags/           GET /api/tags
  components/           ContactForm, ContactCard, ContactList, SearchBar, AddContactPanel
  lib/
    prisma.ts            Prisma client singleton (libSQL adapter)
    validation.ts         Zod schemas for create vs. partial update
prisma/
  schema.prisma          Contact / Tag models
  seed.ts                 Sample data
```

## API reference

All endpoints return JSON.

| Method | Path                | Description                                      |
| ------ | ------------------- | ------------------------------------------------ |
| GET    | `/api/contacts`     | List contacts. Query params: `q` (search), `tag` |
| POST   | `/api/contacts`     | Create a contact                                 |
| GET    | `/api/contacts/:id` | Get one contact                                  |
| PATCH  | `/api/contacts/:id` | Partially update a contact                       |
| DELETE | `/api/contacts/:id` | Delete a contact                                 |
| GET    | `/api/tags`         | List all tags                                    |

`POST`/`PATCH` body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "555-0100",
  "company": "Analytical Engines Ltd",
  "notes": "...",
  "favorite": true,
  "tags": ["mentor", "tech"]
}
```

`PATCH` is a true partial update: omitted fields are left unchanged
(including `favorite` and `tags`) rather than being reset to their defaults.

## Testing

```bash
npm test
```

Covers Zod validation (including the create-vs-update default-value
distinction) and component behavior (favorite toggling, delete confirmation,
edit-mode switching, form submission and error display) via Vitest and
React Testing Library.

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
