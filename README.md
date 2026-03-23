# Heuric Web SDK

A lightweight, drop-in UX analytics SDK that automatically captures user interactions (clicks and scrolls) and sends them to your backend in clean, privacy-focused batches.

## 🚀 Installation

Install the package via NPM or your preferred package manager:

```bash
npm install @heuric/web-sdk
# or
yarn add @heuric/web-sdk
```

## 🛠 Usage & Setup

### 1. Initialize the SDK
Initialize the SDK once in your application's root component or layout.

**For Next.js / React (App Router):**
Create a client component (`Tracker.tsx`):
```tsx
"use client";

import { useEffect } from "react";
import { initHeuric } from "@heuric/web-sdk";

export default function HeuricTracker() {
  useEffect(() => {
    initHeuric({
      endpoint: "https://your-api.com/webhooks/events",
      projectId: "your-project-id",
      // Optional: flushInterval: 5000, 
      // Optional: flushThreshold: 20
    });
  }, []);

  return null;
}
```

### 2. Add to your Root Layout
Drop the `<HeuricTracker />` component into your main layout so it runs on every page:
```tsx
import HeuricTracker from "./components/HeuricTracker";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HeuricTracker />
        {children}
      </body>
    </html>
  );
}
```

---

## 🔒 Privacy & Security Defaults
By default, the SDK heavily prioritizes user privacy:
- **`Password` and `hidden` inputs** are strictly ignored.
- **Credit Card** inputs (`autocomplete="cc-*"`) are ignored.
- **Emails and Numbers** inside clicked text are scrubbed and replaced with `[EMAIL]` and `[NUMBER]` before being sent to your database.
- Elements with the `.heuric-ignore` class are completely ignored by the click tracker.

---

## 🧪 Testing Locally

If you want to quickly test how the SDK behaves without installing it in a full React application, we provide a standalone test playground.

1. Clone this repository.
2. Open `test.html` in your browser.
3. At the bottom of the file, replace the `endpoint` with a testing webhook (like [Webhook.site](https://webhook.site/)).
4. Click around the page, scroll down, and watch your browser's **Network Tab** or your webhook dashboard!

> **Note**: The SDK uses `navigator.sendBeacon` with `text/plain` blobs to bypass aggressive CORS preflights, ensuring your event batches arrive safely even on cross-origin requests.
