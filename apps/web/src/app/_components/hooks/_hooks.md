# Directory Overview: `src/app/_components/hooks`
This folder contains custom React hooks that encapsulate reusable logic to improve modularity and maintainability. Custom hooks simplify component behavior, making the code cleaner and reducing repetition.

## `useAlerts.tsx`
**Purpose**
The useAlerts hook manages a list of alert notifications. It allows components to add and remove alerts dynamically.

### Code Summary
**1. State Management:**
- `alerts`: Array of alert objects with properties:
  - `id`: Unique identifier.
  - `type`: Type of alert ("`success`", "`error`", or "`info`").
  - `message`: Short message for the alert.
  - `description`: Optional description for additional context.

**2. Functions:**
- `addAlert`: Adds a new alert to the list.
  - Generates a unique `id` using `Date.now()`.
- `removeAlert`: Removes an alert by its id.

**3. Returned Values**:
- `alerts`: Current list of alerts.
- `addAlert`: Function to add alerts.
- `removeAlert`: Function to remove alerts.

## `useModal.tsx`

**Purpose**
The useModal hook manages modal visibility state and handles closing the modal when the Escape key is pressed.

### Code Summary

**1. State Management:**
- `isOpen`: Boolean state to determine if the modal is open or closed.

**2. Functions:**
- `openModal`: Opens the modal.
- `closeModal`: Closes the modal.

**3. Effect for Escape Key:**
- Adds an event listener to close the modal when the user presses the `Escape` key.
- Cleans up the event listener when the component unmounts.

**4. Returned Values:**
- `isOpen`: Current state of the modal.
- `openModal`: Function to open the modal.
- `closeModal`: Function to close the modal.

| **Hook**         | **Purpose**                                                                 | **Functions**                               | **Usage Scenarios**                                    |
|------------------|-----------------------------------------------------------------------------|--------------------------------------------|-------------------------------------------------------|
| `useAlerts.tsx`  | Manages alert notifications (add/remove alerts).                           | `addAlert(alert)`, `removeAlert(id)`       | Displaying success/error/info alerts to the user.     |
| `useModal.tsx`   | Manages modal state (open/close) and handles Escape key events for closing. | `openModal()`, `closeModal()`, `isOpen`    | Managing modal visibility in various components.      |
