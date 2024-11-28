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

### **Installation**


1. Clone the repository:
   ```bash
   git clone https://github.com/Vagabonds-Labs/marketplace.git
   cd marketplace
   ```

2. Install dependencies:
   ```bash
   bun install
   ```
3. Rename
   ```bash
   mv .env.example to .env 
   ```

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

## 📝 **Contributing**

We welcome contributions from the community! Here's how you can help:

1. **Clone and Fork Repo**: Click the **Fork** button in the top-right corner to create a copy of the repository under your account.

    - <a href="https://github.com/Vagabonds-Labs/cofiblocks" target="_blank"> HERE</a>

#

2. **Clone the Fork:** 
    - Clone the forked repository to your local machine by running the following command:

    ```bash
   git clone https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
   ```

    - Replace `YOUR_USERNAME` and `REPOSITORY_NAME` with your GitHub username and the repository name.

#

3. **Create a new branch or use the main branch:** When modifying contracts kindly make sure the formatting is correct and all tests pass successfully.

    - Create a branch name based on the type of change (e.g., `feat/name-related-issue`, `docs/name-related-issue`).

    ```
    git checkout -b branch-name
    ```
    - One of ideas on how to implement it for the branch name:

        > `docs/update-readme` or `fix/bottom-bug`.

#

4. **Commit:** Commit your changes.

    1. **git add (file-name)**
    2. **git commit -m "[type] description"**

    - Example: 
    ```
    `git add Create_Documentation`

    `git commit -m "[docs]: update documentation"`
    ```

#

5. **Push fork:** Push to your fork and submit a pull request on our `main` branch. Please provide us with some explanation of why you made the changes you made. For new features make sure to explain a standard use case to us.

- Push your changes to your forked repository:
    ```bash
   git push origin your-branch-name
   ```
   > Replace `your-branch-name` with the name of your branch.

- Example: 

    ```bash
    `git push origin fix/bug-fix`
    ```

#

6. **Submit a Pull Request:** Submit a pull request to the `main` branch of the Semaphore Stellar SDK repository.

    - <a href="https://github.com/Vagabonds-Labs/cofiblocks/pulls" target="_blank"> Summit pull request</a>

# **📁 Commits**

You can do a regular commit by following the next:

``` [type] significant message ```

- <a href="https://www.conventionalcommits.org/en/v1.0.0/" target="_blank">Learn more about conventional commits</a>

### Type

**The type must be one of the following:**

- feat: A new feature.
- fix: A bug fix.
- docs: Documentation only changes.
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- refactor: A code change that neither fixes a bug nor adds a feature (improvements of the code structure).
- perf: A code change that improves the performance.
- test: Adding missing or correcting existing tests.
- build: Changes that affect the build system or external dependencies (example scopes: gulp, npm).
- ci: Changes to CI configuration files and scripts (example scopes: travis, circle).
- chore: Other changes that don't modify src or test files.
- revert: Reverts a previous commit.

# **🔗 Branches**
1. There must be a `main` branch, used only for the releases.
2. Avoid long descriptive names for long-lived branches.
3. Use kebab-case (no CamelCase).
4. Use grouping tokens (words) at the beginning of your branch names (in a similar way to the `type` of commit).
5. Define and use short lead tokens to differentiate branches in a way that is meaningful to your workflow.
6. Use slashes to separate parts of your branch names.
7. Remove your branch after merging it if it is not important.
**Examples:**
```
git branch -b docs/readme
git branch -b test/a-feature
git branch -b feat/sidebar
git branch -b fix/b-feature
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