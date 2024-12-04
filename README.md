# **CofiBlocks - La Comunidad del Café ☕️**

CofiBlocks is the first Collaborative Business connecting traditional coffee-growing communities in Costa Rica and worldwide directly with coffee lovers using Starknet blockchain technology. Our mission is to distribute benefits among all members, ensuring fair trade, community engagement, and technological innovation.

## 🚀 Roadmap

### **2022-2023 Season**
Thank you to everyone who participated in our first season and enjoyed coffee from the slopes of Volcán Poás.

### **2024-2025 Season**
We are preparing to launch our second season, featuring coffee from additional coffee-growing regions of Costa Rica.

**Want to bring CofiBlocks to your region?** 

- [Contact Us ](mailto:info@cofiblocks.com)

## 🌎 Movement
```
CofiBlocks is more than just a coffee marketplace; it's a movement for a more equitable and sustainable coffee future. With a strong foundation and a passionate community, CofiBlocks is poised to transform the way coffee is produced, distributed, and enjoyed worldwide. Whether you're a coffee enthusiast or a blockchain believer, CofiBlocks invites you to join their journey.
```

## 📌 Fundamental Links Info

- [Learning about modern collaborative businesses with CofiBlocks](https://medium.com/cambiatus/conociendo-de-modernos-negocios-colaborativos-con-cofiblocks-88ed3ddfa88a)

- [CofiBlocks: Innovating the Coffee Industry in Costa Rica with Web3](https://mirror.xyz/0xF574753688ABf9740660DFb02E84E4599CA6Eb87/QneFnlPqTRuV_3jt7Kd6foBfFokOKN6zNcJCqpj_xkw)

- [Pitch Deck](https://docs.google.com/presentation/d/16zPeDC-6fMaCRRpaQCTPPIn_ZKdI0d9ZArkTxd2wmAA/edit#slide=id.p1)

## 👥 Meet the Team

### ☕ **FOUNDERS**

### Omar Hurtado Munguia
**Co-founder**

Omar's journey from coffee picker to coffee tour guide in Poás de Alajuela inspired the creation of CofiBlocks. He brings firsthand knowledge of the challenges small producers face.

- [History](https://www.youtube.com/watch?v=OjymLl3zKss)

### Karla Córdoba Brenes
**Co-founder**

Karla contributes her extensive experience in blockchain technology and impact-driven solutions.

### Ranulfo Paiva Sobrinho
**Co-founder**

Ranulfo's background in blockchain development and collaborative economies helps drive the technical and organizational aspects of CofiBlocks.

#

### 💻 **MAINTAINERS**

### Alberto - Brolag
**Full Stack Developer Web3**

- [Brolag GitHub](https://github.com/brolag)
- [Twitter](https://x.com/brolag)

### Erick - Evgongora
**Full Stack Developer Web3**

- [Erick GitHub](https://github.com/evgongora)
- [Twitter](https://x.com/3rickDev)

### Randall Valenciano
**Full Stack Developer Web3**

- [Randall GitHub](https://github.com/rvalenciano)
- [Twitter](https://x.com/Ravf226)

## 🎉 Join the Community

- Website: [CofiBlocks Website](https://cofiblocks.com)
- X: [Follow us on Twitter](https://twitter.com/cofiblocks)
- Telegram ODHack: [Join our Telegram ODHACK Group](https://t.me/cofiblocksodhack)
- Telegram for Devs: [Join our Telegram Devs Cofi Group](https://t.me/cofiblocksodhack)

## 🛠️ **Getting Started**

### **Prerequisites**
- Node.js (>= 18)
- Bun package manager (bun@1.1.24)
- Prisma

### **Crate file**

`/cofiblocks/apps/web/sql/init.sql`

- And REPLACE MYSQL_USER with your mysql user in the .env
```bash
GRANT CREATE ON *.* TO '<MYSQL_USER>'@'%';
GRANT ALL PRIVILEGES ON *.* TO '<MYSQL_USER>'@'%';
```

### **Docker-compose.yml**

Add this to your docker-compose.yml file:

```bash
version: '3.8'
services:
  db:
    image: mysql:8.4
    container_name: mysql
    restart: always
    env_file:
      - ./apps/web/.env
    ports:
      - '3306:3306'
    healthcheck:
      test: ['CMD-SHELL', 'mysqladmin ping -h 127.0.0.1 --password="$$(cat /run/secrets/db-password)" --silent']
      interval: 3s
      retries: 5
      start_period: 30s
    volumes:
      - mysql-data:/var/lib/mysql
      - ./apps/web/sql/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql-data:
```

### **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/Vagabonds-Labs/cofiblocks.git
   cd cofiblocks
   ```

   - Run `docker compose up`, to access the database.

2. Install dependencies:
   ```bash
   bun install
   ```
3. Rename
   ```bash
   mv .env.example to .env 
   ```
   **And add this in your .env file:**

      ```bash
      MYSQL_ROOT_PASSWORD=
      MYSQL_DATABASE=
      MYSQL_USER=
      MYSQL_PASSWORD=

      DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD
      }@localhost:3306/${MYSQL_DATABASE}?
      connect_timeout=10"
      ```
      **Important:**
      - Add and run `docker compose up` in this part.

4. Generate the Prisma client:
   ```bash
   bun prisma generate
   ```

5. Run the development server:
   ```bash
   bun turbo dev
   ```

**Make sure the values in the .env file are configured correctly for your environment.**


### **Project Structure**

The project is organized using workspaces:

- `apps/` - Contains the main web application.
- `packages/` - Shared packages and utilities.

Key scripts include:

- `build`: Build the project.
- `dev`: Start the development server.
- `db:migrate`: Apply database migrations.
- `db:seed`: Seed the database with initial data.

### **Key Technologies**

1. **StarkNet**
   ```bash
   StarkNet is a decentralized, permissionless Layer 2 solution for Ethereum. It uses ZK-STARKs (zero-knowledge proofs) to enable fast and cost-efficient transactions while ensuring security and scalability. Developers can deploy smart contracts, and users benefit from significantly reduced gas fees compared to Ethereum's mainnet.
   ```
2. **Prisma**
   ```bash
   Prisma is a modern database toolkit for Node.js and TypeScript. It provides an ORM (Object-Relational Mapping) that simplifies working with databases, allowing developers to define models and query data in a type-safe way. Prisma supports multiple databases, including PostgreSQL, MySQL, and MongoDB
   ```
3. **Bun**
   ```bash
   Bun is an all-in-one JavaScript runtime that competes with Node.js and Deno. It’s built for performance and includes a fast bundler, transpiler, and package manager. Bun aims to speed up development workflows, reduce dependency on third-party tools, and execute JavaScript and TypeScript quickly. It’s designed to handle server-side apps, scripts, and front-end tooling.
   ```

## 📚 **Code of Conduct**

We are committed to creating a welcoming and inclusive environment. Please read our [Community Guidelines](COMMUNITY_GUIDELINES.md) to ensure a positive experience for everyone involved.

## 🤖 Development Resources

### **CofiBlocks Dev Assistant**

We've created a custom GPT to assist with development tasks related to CofiBlocks. This AI-powered assistant is designed to help with coding, answer questions about our tech stack, and provide guidance on best practices.

Access the CofiBlocks Dev Assistant here:

- [CofiBlocks Dev Assistant](https://chatgpt.com/g/g-JIRAV36d5-cofiblocks-dev-assistant)

Features:
- Coding assistance for our tech stack (Next.js, TypeScript, TailwindCSS, etc.)
- Guidance on project structure and best practices
- Help with Starknet and blockchain-related development
- Quick answers to common development questions

Feel free to use this resource during your development process to streamline your workflow and get quick answers to your questions.


### **Prompt Guide**

To streamline our development process and maintain consistency across the project, we've created a comprehensive prompt guide. This guide covers various custom prompts designed to assist with component generation, code-related tasks, and information retrieval.

**Key features of our prompt guide include:**

- Instructions for using SudoLang, a powerful pseudocode language for AI collaboration.
- Detailed usage guidelines for our custom prompts:
   ```
  V0PromptWithComponent for generating v0.dev prompts
  ```
  ```
  TailwindReactComponentGenerator for creating React components with Tailwind CSS
  ```
  ```
  PerplexityBot for efficient information searches
  ```
- Best practices for prompt usage and troubleshooting tips

**For full details and usage instructions, please refer to our** 

- [Prompt Guide](docs/prompt-guide.md).

#