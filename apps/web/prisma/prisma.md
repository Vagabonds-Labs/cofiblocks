# Prisma Configuration (`/prisma`)
The prisma directory contains all the database configuration, models, migrations, and seeding logic required for the CofiBlocks application.

### File Breakdown
**1. `schema.prisma`**
The `schema.prisma` file is the central configuration file for Prisma ORM. It includes the database provider, the connection URL, and the models that define the database tables.

**2. `migrations/`**
The migrations folder stores all the migration history. Each folder is named with a timestamp and description.

- `migration.sql`: Contains the SQL statements Prisma generates based on changes in the schema.
- `migration_lock.toml`: Ensures consistency across migrations.

**3. `seed.js`**
The `seed.js` script populates the database with initial data. This is particularly useful for development and testing.

```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      walletAddress: '0x1234567890',
      name: 'Admin User',
      email: 'admin@cofiblocks.com',
      role: 'ADMIN',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### Scripts and Commands
**Generate Prisma Client**

```bash
npx prisma generate
```
**Run Migrations**
- Create and apply migrations:

```bash
npx prisma migrate dev
```
- Apply migrations in production:

```bash
npx prisma migrate deploy
```

**Seed the Database**
```bash
npx prisma db seed
```

**Open Prisma Studio**
View and edit database records using a visual UI:

```bash
npx prisma studio
```

---

### Development Guidelines
**1. Schema Changes**:
- Modify `schema.prisma`.
- Run `npx prisma migrate dev` to generate a new migration.

**2. Seeding**:
- Add initial data to `seed.js`.
- Run `npx prisma db seed`.

**3. Environment Variables**:
- Ensure DATABASE_URL is correctly configured in .env:
  
  ```env
  DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${MYSQL_DATABASE}?connect_timeout=10"
  ```







