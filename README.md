# **CofiBlocks - La Comunidad del Café ☕️**

CofiBlocks is the first Collaborative Business connecting traditional coffee-growing communities in Costa Rica and worldwide directly with coffee lovers using StarkNet blockchain technology. Our mission is to distribute benefits among all members, ensuring fair trade, community engagement, and technological innovation.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 **Roadmap**

| **Season**        | **Details**                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **2022-2023**      | Thank you to everyone who participated in our first season featuring coffee from the slopes of Volcán Poás. |
| **2024-2025**      | Launching our second season with coffee from additional regions of Costa Rica.  |

**Want to bring CofiBlocks to your region?**  
📧 [Contact Us](mailto:info@cofiblocks.com)

---

## 🌎 **Movement**

CofiBlocks is more than just a coffee marketplace; it's a movement for a more equitable and sustainable coffee future. With a strong foundation and a passionate community, we aim to transform the way coffee is produced, distributed, and enjoyed worldwide. Whether you're a coffee enthusiast or a blockchain believer, join us on this journey!

---

## 📌 **Fundamental Links**

- [Learning about Modern Collaborative Businesses with CofiBlocks](https://medium.com/cambiatus/conociendo-de-modernos-negocios-colaborativos-con-cofiblocks-88ed3ddfa88a)  
- [CofiBlocks: Innovating the Coffee Industry in Costa Rica with Web3](https://mirror.xyz/0xF574753688ABf9740660DFb02E84E4599CA6Eb87/QneFnlPqTRuV_3jt7Kd6foBfFokOKN6zNcJCqpj_xkw)  
- [Pitch Deck](https://docs.google.com/presentation/d/16zPeDC-6fMaCRRpaQCTPPIn_ZKdI0d9ZArkTxd2wmAA/edit#slide=id.p1)

---

## 👥 **Meet the Team**

### ☕ **Founders**  
- **Omar Hurtado Munguia**: From coffee picker to coffee tour guide, Omar's journey inspired CofiBlocks. [Watch his story](https://www.youtube.com/watch?v=OjymLl3zKss).  
- **Karla Córdoba Brenes**: Blockchain expert focused on impact-driven solutions.  
- **Ranulfo Paiva Sobrinho**: Blockchain developer with expertise in collaborative economies.  

### **Maintainers**  
- **Alberto - Brolag**  
  - [GitHub](https://github.com/brolag) | [Twitter](https://x.com/brolag)  
- **Erick - Evgongora**  
  - [GitHub](https://github.com/evgongora) | [Twitter](https://x.com/3rickDev)  
- **Randall Valenciano**  
  - [GitHub](https://github.com/rvalenciano) | [Twitter](https://x.com/Ravf226)

---

## 🎉 **Join the Community**

- 🌐 [Website](https://cofiblocks.com)  
- 🐦 [Follow us on Twitter](https://x.com/cofiblocks)  
- 💬 [Telegram for ODBoost](https://t.me/cofiblocksodhack)  
- 💻 [Telegram for Developers](https://t.me/cofiblocksodhack)

---

## 🛠️ **Getting Started**

### **Prerequisites**  
- Node.js (>= 18)  
- Bun package manager (bun@1.1.24)  
- Prisma  

### **Installation**
1. Clone the repository:  
   ```bash
   git clone https://github.com/Vagabonds-Labs/cofiblocks.git
   cd cofiblocks
   ```  
2. Install dependencies:  
   ```bash
   bun install
   ```  
3. Configure the environment variables:  
   - Rename `.env.example` to `.env` and populate it with the following:  
     ```bash
     MYSQL_ROOT_PASSWORD=
     MYSQL_DATABASE=
     MYSQL_USER=
     MYSQL_PASSWORD=

     DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${MYSQL_DATABASE}?connect_timeout=10"
     ```  
4. Start the database:  
   ```bash
   docker compose up
   ```  
5. Generate the Prisma client:  
   ```bash
   bun prisma generate
   ```  
6. Start the development server:  
   ```bash
   bun turbo dev
   ```  

### **Troubleshooting Tips**  
- **Database Connectivity Issues**: Ensure the database credentials in `.env` are correct.  
- **Docker Errors**: Verify that Docker is running and the `docker-compose.yml` file is configured properly.

---

## 📚 **Development Resources**

### **CofiBlocks Dev Assistant**  
Our custom GPT assistant helps with coding, StarkNet guidance, and blockchain-related development. [Access it here](https://chatgpt.com/g/g-JIRAV36d5-cofiblocks-dev-assistant).  

### **Prompt Guide**  
Explore our detailed [Prompt Guide](docs/prompt-guide.md) to streamline your workflow.

---

## 🛠️ **Key Technologies**

- **StarkNet**: Scalable Layer 2 solution for Ethereum with reduced gas fees.  
- **Prisma**: Type-safe, modern ORM for working with databases.  
- **Bun**: High-performance runtime for JavaScript/TypeScript.  

---

## 💡 **Contributions**

We welcome contributors! Here's how you can help:  
1. Review [open issues](https://github.com/Vagabonds-Labs/cofiblocks/issues).  
2. Submit pull requests with detailed explanations.  
3. Suggest new features or improvements.
