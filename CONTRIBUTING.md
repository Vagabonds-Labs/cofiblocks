# **CONTRIBUTING GUIDE BY COFIBLOCKS** ☕

Thank you for your interest in contributing to CofiBlocks! We appreciate your time and effort in making our project better.

This guide will help you get started with contributing to our project. Please note that we have a code of conduct, which we expect all contributors to adhere to.

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
    git add Create_Documentation

    git commit -m "[docs]: update documentation"
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
    git push origin fix/bug-fix
    ```

6. **Submit a Pull Request:** Submit a pull request to the `main` branch of the CofiBlocks repository.

    - <a href="https://github.com/Vagabonds-Labs/cofiblocks/pulls" target="_blank"> Summit pull request</a>

# 📌 Update your Fork and Local Repository

### 🔒 Set up the original repository as upstream (only once)
- **Check your remote.**
```bash
git remote -v
```

- **If you don't see `upstream`, add it.**
```bash
git remote add upstream https://github.com/Vagabonds-Labs/cofiblocks.git
```
#

### 🔩 Update your Fork
1. **Bring the latest changes from the original repository.**
    ```bash
    git fetch upstream
    ```
2. **Switch to the `main` branch of your local repository.**
    ```bash
    git checkout main
    ```
3. **Merge `upstream/main` changes to your local branch.**
    ```bash
    git merge upstream/main
    ```
4. **Upload the changes to your fork in GitHub.**
    ```bash
    git push origin main
    ```
#

### 🔧 Update other branches
- **Change to the branch you want to update.**
```bash
git checkout name-of-your-rama
```
- **Take an overflow with the updated `main` branch.**
```bash
git rebase main
```
- **Upload the changes to your fork.**
```bash
git push origin name-of-your-rama --force
```

## 🎯 **Common mistakes**
1. **Local changes without saving.**
    - Save changes temporarily
    ```bash
    git stash
    ```
2. **Then update and recover your changes.**
    ```bash
    git stash pop
    ```
3. **Untracked files causing conflict.**
    - Delete them if you don't need them
    ```bash
    rm filename
    ```

# **📁 Commits**

You can do a regular commit by following the next:

``` [type] significant message ```

- <a href="https://www.conventionalcommits.org/en/v1.0.0/" target="_blank">Learn more about conventional commits</a>

### Type

Add changes you worked on the issue.

**Examples:**

```bash
git commit -m "[docs]: update documentation"
``` 

```bash
git commit -m "[fix]: fix bug in code"
``` 

```bash
git commit -S -m "[test]: add test case"
```
**Other Example:**

- If you wnat to sign your commits, you can use the `-S` flag.

```bash
git commit -S -m "[refactor]: Changes in the code"
``` 

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
#