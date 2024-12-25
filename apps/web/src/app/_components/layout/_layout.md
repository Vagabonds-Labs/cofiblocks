# Layout Components

This folder contains layout components that are used to structure the pages of the application. These components help in maintaining a consistent layout across different parts of the application.

## Components

### [`Fonts.tsx`](src/app/_components/layout/Fonts.tsx)

This component imports and sets up the Google Fonts used in the application. It defines CSS variables for the fonts to be used globally.

#### Example Usage

```tsx
import Fonts from './Fonts';

function App() {
  return (
    <>
      <Fonts />
      {/* Other components */}
    </>
  );
}
```
### [`Header.tsx`](src/app/_components/layout/Header.tsx)

This component renders the header of the application, including the page title, user address, and cart information. It uses the `PageHeader` component from the `@repo/ui` package.

#### Example Usage

```tsx
import Header from './Header';

function App() {
  return (
    <>
      <Header />
      {/* Other components */}
    </>
  );
}
```

### [`Main.tsx`](src/app/_components/layout/Main.tsx)

This component serves as the main layout wrapper for the application. It ensures that the content is centered and styled consistently.

```tsx
import Main from './Main';

function App() {
  return (
    <Main>
      {/* Other components */}
    </Main>
  );
}
```

### [`Sitehead.tsx`](src/app/_components/layout/Sitehead.tsx)

This component sets up the HTML head for the application, including the title, meta description, and favicon.

```tsx
import SiteHead from './SiteHead';

function App() {
  return (
    <>
      <SiteHead />
      {/* Other components */}
    </>
  );
}
```

