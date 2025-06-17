# CofiBlocks Web

## Running the Application

Follow the steps below to set up and run the CofiBlocks web application.

### 1. Set Up Environment Variables

Create a `.env` file by copying the example configuration:

```bash
cp .env.example .env
```

Then, fill in the required values in the `.env` file:

- **`DATABASE_URL`**: The database connection URL.
  - Example for a local MySQL setup:
    ```
    mysql://root:root@127.0.0.1:3306/web
    ```

### 2. Start the Database

Ensure Docker is running and execute the script to start the database:

```bash
./start-database.sh
```

### 3. Generate Database Migrations

Run the following command to generate the required database migrations:

```bash
bun db:generate
```

### 4. Generate Prisma Client

Execute the command to generate the Prisma client:

```bash
bun postinstall
```

### 5. Start the Application

To run the application in development mode, use:

```bash
bun turbo dev
```

## Running the Application with Docker

Follow the steps below to set up and run the CofiBlocks web application using Docker.

### 1. Set Up Environment Variables

Create a `.env` file by copying the example configuration:

```bash
cp .env.example .env
```

Then, fill in the required values in the `.env` file:

- **`DATABASE_URL`**: The database connection URL.
  - Example for a local MySQL setup:
    ```
    mysql://root:root@127.0.0.1:3306/web
    ```

### 2. Build and Start the Docker Containers

Ensure Docker is running and execute the following commands to build and start the Docker containers:

```bash
docker-compose down
docker-compose up --build
```

### 3. Access the Application

Once the containers are up and running, you can access the application at:

```
http://localhost:3000
```

