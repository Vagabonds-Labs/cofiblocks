# Commit Message Hook - `template_checker.sh`

The **`template_checker.sh`** script is a commit message hook designed to enforce the **Conventional Commit** format. This ensures that all commit messages adhere to a standard structure, improving project history clarity and maintainability.

---

## Purpose

The script validates commit messages against a predefined **Conventional Commit** pattern. If the commit message does not match the required format, the script blocks the commit and provides an error message.

## Explanation of the Script

###### 1. Shebang Line
  ```bash
  #!/bin/bash
  ```
- Specifies that the script should be executed using the Bash shell.
  
###### 2. Path to Commit Message File
```bash
INPUT_FILE=$1
```
- The path to the commit message file is passed as an argument when the `commit-msg` hook is triggered.

###### 3. Read the First Line of the Commit Message
```bash
START_LINE=$(head -n1 "$INPUT_FILE")
```
- Reads only the first line of the commit message, which is where the Conventional Commit format is applied.
  
###### 4. Define the Regex Pattern
```bash
PATTERN="^(feat|fix|docs|style|refactor|test|chore)(\([a-zA-Z0-9_-]+\))?: .+"
```
- Defines the Conventional Commit regex pattern:
    - `feat`, `fix`, `docs`, `style`, `refactor`, `test`, and `chore` are the allowed commit types.
    - Optional scope: `(scope)` describes the area of the code affected.
    - A colon `:` followed by a description is required.
- Examples of valid commit messages:
    - `feat: add new feature`
    - `fix(login): resolve login bug`

###### 5. Validate the Commit Message
```bash
if ! [[ "$START_LINE" =~ $PATTERN ]]; then
  echo "Bad commit message, see example: feat: add new feature"
  exit 1
fi
```
- Checks if the first line matches the defined regex pattern.
- If the message is invalid, an error message is displayed:
  ```sql
  Bad commit message, see example: feat: add new feature
  ```
- The script exits with code 1, blocking the commit.
  
###### 6. Exit with Success
```bash
exit 0
```
- If the commit message passes validation, the script exits with code 0, allowing the commit to proceed.
