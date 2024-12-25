# Constants

This folder contains various constants used throughout the application. These constants include configuration values, URLs, and application-specific messages.

## Constants

### [index.tsx](apps/web/src/constants/index.tsx)

This file defines constants related to Argent and application-specific settings.

#### Example Usage

```tsx
import {
  ARGENT_DUMMY_CONTRACT_ADDRESS,
  ARGENT_SESSION_SERVICE_BASE_URL,
  ARGENT_WEBWALLET_URL,
  SIGNER,
  DOMAIN_NAME,
  WELCOME_MESSAGE,
  MESSAGE,
} from './constants';

function App() {
  console.log(WELCOME_MESSAGE);
  return (
    <div>
      <h1>{DOMAIN_NAME}</h1>
      <p>{WELCOME_MESSAGE}</p>
    </div>
  );
}