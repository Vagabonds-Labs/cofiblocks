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

### Fixed
- Resolved potential issues with environment variable validation
- Fixed IPFS image loading in shopping cart
- Fixed cart counter synchronization with server state

### Removed
- Removed unused boilerplate code from initial setup

### Security
- Implemented secure practices for handling wallet addresses and user data
- Added transaction validation for Starknet payments

### Development
- Added scripts for database management and development server startup
- Configured Turborepo for optimized build and development processes
