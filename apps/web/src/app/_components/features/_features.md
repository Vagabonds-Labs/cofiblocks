# Directory Overview: `src/app/_components/features`
This folder appears to contain feature-specific components that are used across different parts of the app. These components likely handle modals, lists, cards, and reusable pieces of the UI for product, order, and profile management.

### Files and Their Purpose

| **File Name**                | **Description**                                                                                     | **Usage Scenarios**                                 |
|------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------------|
| `FarmModal.tsx`              | Modal component for viewing or managing **farm-related information**.                              | Used to display or edit farm details.              |
| `FilterModal.tsx`            | A **filter modal** for selecting filters to refine data, such as products or orders.               | Appears when filtering items in a list or table.   |
| `LogoutModal.tsx`            | A confirmation modal for **logging out** the user.                                                 | Triggered when a user clicks "Logout".             |
| `OrderListItem.tsx`          | Represents a **single item** in an order list. Displays order-specific details (e.g., name, price).| Used in the order list view.                       |
| `OrderListPriceItem.tsx`     | Displays the **price details** for an item in the order list (e.g., subtotal, tax, total).         | Part of an order summary section.                  |
| `OrderDetails.tsx`           | Displays **detailed information** about a specific order.                                          | Used in the "Order Details" page or modal.         |
| `ProducerInfo.tsx`           | Component to display information about a **producer** (e.g., name, region, contact info).          | Used in user profiles or product pages.            |
| `ProductCatalog.tsx`         | Displays a list of products in a **catalog format**.                                               | Used in the marketplace or product listing page.   |
| `ProductDetails.tsx`         | Displays **detailed information** about a specific product (e.g., name, price, description).       | Used in the product detail view or modal.          |
| `ProductDetailsList.tsx`     | A **list view** that displays multiple product details.                                            | Used in detailed product listings or comparisons.  |
| `ProductList.tsx`            | Displays a **list of products**, each as an individual card or item.                               | Used in the marketplace to show product previews.  |
| `ProductStatusDetails.tsx`   | Displays the **status** of a product (e.g., "Available", "Sold Out", "Pending").                   | Used in the product management dashboard.          |
| `ProfileCard.tsx`            | A **card component** for displaying user profile information.                                      | Used in profile overview or team member listings.  |
| `ProfileOptionLayout.tsx`    | Layout wrapper for organizing **profile-related options**.                                         | Used in the user profile settings page.            |
| `ProfileOptions.tsx`         | Displays **user profile options** like "Edit Profile", "Change Password", or "Logout".             | Used in dropdown menus or sidebars.                |
| `SearchBar.tsx`              | A **search bar component** that includes an input field for searching items.                       | Used in product catalogs, order lists, or tables.  |
| `SelectionTypeCard.tsx`      | Card component for selecting a specific **type or option** (e.g., categories, filters).            | Used in selection modals or onboarding flows.      |
| `ShoppingCart.tsx`           | Displays the **shopping cart** UI, showing items, quantities, and total cost.                      | Used in the cart page or sidebar.                  |
| `StatusBanner.tsx`           | A **banner** component to display statuses or messages (e.g., "Order Completed", "Error").         | Used for system notifications or inline statuses.  |
| `StatusUpdateModal.tsx`      | Modal component for updating the **status** of an item (e.g., order status or product availability).| Triggered when editing statuses in a dashboard.    |
| `UserWalletsModal.tsx`       | A modal for displaying and managing **user blockchain wallets**.                                   | Used for wallet integrations or account settings.  |
| `types.ts`                   | TypeScript **type definitions** for props and state used by components in this folder.             | Ensures consistent typing across components.       |

---

## Key Patterns in features Directory

**1. Modals:**
- Files like `FarmModal.tsx`, `LogoutModal.tsx`, `FilterModal.tsx`, and `StatusUpdateModal.tsx` handle specific user actions via modals.
- Purpose: Provide confirmation, input forms, or additional information.

**2. Lists:**
- Files like `OrderListItem.tsx`, `ProductList.tsx`, and `ProductDetailsList.tsx` display data in a list format.
- Purpose: Represent multiple items concisely, often used in tables or product views.

**3. Detailed Views:**
- Files like `OrderDetails.tsx`, `ProductDetails.tsx`, and `ProducerInfo.tsx` display detailed information about orders, products, or users.
- Purpose: Show in-depth data to the user.

**4. Cards:**
- Files like `ProfileCard.tsx` and `SelectionTypeCard.tsx` represent data as reusable cards.
- Purpose: Compact, visually appealing representation of user profiles or options.

**5. Search and Status Components:**
- `SearchBar.tsx` handles input-based filtering.
- `StatusBanner.tsx` provides status-based feedback to the user.

**6. Wallet Integration:**
- `UserWalletsModal.tsx` focuses on integrating blockchain wallet details.

**7. Type Definitions:**
- `types.ts` ensures all components maintain consistent typing and avoids bugs due to incorrect props.

--- 



