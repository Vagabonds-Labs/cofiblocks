# Changelog

## [Unreleased]

### Added
- Initial project setup for CofiBlocks, a collaborative coffee business platform
- Monorepo structure with apps for web and docs
- Starknet integration for blockchain functionality
- Prisma setup for database management
- TailwindCSS and DaisyUI for styling
- Next.js framework for both web and docs applications
- TypeScript configuration for improved type safety
- ESLint and Prettier setup for code quality and formatting
- Custom UI components including Typography and Layout elements
- Environment variable management with @t3-oss/env-nextjs
- Database seeding script for initial data population
- Starknet provider for blockchain connectivity
- TRPC setup for type-safe API routes
- Implemented Starknet payment processing in checkout flow
- Added loading states and error handling for payment transactions
- Integrated cart management with blockchain transactions
- Added i18n translations for checkout and payment flows

### Changed
- Updated project structure to use Turborepo for monorepo management
- Configured custom themes for DaisyUI
- Enhanced OrderReview component with Starknet payment functionality
- Improved error handling and user feedback during payment process
- **Header Component Redesign** (`packages/ui/src/pageHeader.tsx`)
  - Removed hardcoded "CofiBlocks" title from header
  - Reordered navigation elements for better UX:
    - Shopping cart icon now appears before menu icon
    - Increased spacing between icons from `gap-2` to `gap-4`
  - Removed shadow from header by updating className from `bg-white shadow` to `bg-white`
  - Updated logo alt text from "CofiBlocks Logo" to generic "Logo"
  - Removed tooltips from header icons for cleaner interface:
    - Removed tooltip from shopping cart icon
    - Removed tooltip from menu icon
    - Removed Tooltip import as it's no longer needed
  - Maintained all existing functionality:
    - Cart counter badge
    - Cart sidebar
    - Menu sidebar
    - Authentication buttons
    - Profile options
  - Preserved accessibility features:
    - Kept aria-labels on buttons
    - Maintained proper focus states
    - Retained semantic HTML structure
- Simplified wallet connection flow in WalletConnectFlow component
- Improved button disabled states during wallet connection
- Added loading indicator during wallet connection process
- Removed unnecessary console.log statements

### Fixed
- Resolved potential issues with environment variable validation
- Fixed IPFS image loading in shopping cart
- Fixed cart counter synchronization with server state
- Fixed TypeScript error in WalletConnectFlow by removing incorrect await usage
- Improved wallet connection state handling and user feedback
- Added proper loading states to wallet connection buttons
- Enhanced error handling in wallet connection process

### Removed
- Removed unused boilerplate code from initial setup

### Security
- Implemented secure practices for handling wallet addresses and user data
- Added transaction validation for Starknet payments

### Development
- Added scripts for database management and development server startup
- Configured Turborepo for optimized build and development processes

### Technical Details
- **Component Structure**
  - Simplified imports by removing unused Tooltip component
  - Maintained proper TypeScript interfaces and types
  - Kept consistent state management for cart and menu sidebars
  - Preserved responsive design and mobile compatibility

### Visual Changes
- **Layout**
  - Cleaner header without shadow
  - More balanced spacing between navigation elements
  - Consistent icon sizes (w-6 h-6)
  - Maintained hover states and transitions
  - Kept rounded corners on interactive elements

### Accessibility
- **Maintained ARIA Support**
  - `aria-label="Shopping cart"` for cart button
  - `aria-label="Menu"` for menu button
  - Proper focus indicators
  - Semantic HTML structure

### Dependencies
- No changes to package dependencies
- No changes to build configuration

### Testing Notes
- Verify cart functionality works as expected
- Ensure menu opens and closes properly
- Check responsive behavior across different screen sizes
- Validate authentication flows
- Test keyboard navigation

### Added
- Better error handling for wallet connection failures
- Loading state management for wallet connection process
- Proper state handling for connection buttons
