# UI Components

This folder contains UI components that are used to build the user interface of the application. These components are reusable and help in maintaining a consistent look and feel across different parts of the application.

## Components

### [`BottomModal.tsx`](src/app/_components/ui/BottomModal.tsx)

This component renders a modal that slides up from the bottom of the screen. It is useful for displaying additional content or actions without navigating away from the current page.

#### Example Usage

```tsx
import BottomModal from './BottomModal';
import { useState } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <BottomModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p>This is the modal content.</p>
      </BottomModal>
    </>
  );
}
```

### [`LoginAnimation.tsx`](src/app/_components/ui/LoginAnimation.tsx)

This component renders an animated background for the login screen using Framer Motion. It includes particles and background animations.

#### Example Usage

```tsx
import LoginAnimation from './LoginAnimation';
import { useAnimation } from 'framer-motion';

function App() {
  const backgroundControls = useAnimation();
  const controls = useAnimation();

  return (
    <LoginAnimation
      backgroundControls={backgroundControls}
      controls={controls}
    />
  );
}
```

### [`Spinner.tsx`](src/app/_components/ui/Spinner.tsx)

This component renders a loading spinner. It can be used to indicate that a process is ongoing.

#### Example Usage

```tsx
import Spinner from './Spinner';

function App() {
  return (
    <div>
      <Spinner />
    </div>
  );
}
```