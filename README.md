# Heuric Web SDK

A lightweight, drop-in UX analytics SDK that automatically captures user interactions (clicks and scrolls) and sends them to your backend in clean, privacy-focused batches.

## Installation

I am currently working on publishing this to NPM. For now, you will need to download the repository and compile the SDK locally:

1. Download the repo.
2. Run `npm install` followed by `npm run build`.
3. Copy the resulting `dist/heuric.esm.js` file directly into your own project's folder (e.g. `src/lib/heuric.esm.js`).

## Usage and Setup

### 1. Initialise the SDK
Initialise the SDK once in your application's root component or layout.

**For Next.js / React (App Router):**
Create a client component (`Tracker.tsx`):
```tsx
"use client";

import { useEffect } from "react";
import { initHeuric } from "@/lib/heuric.esm.js";

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
Add the `<HeuricTracker />` component into your main layout so it runs on every page:
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

### 3. Setup Supabase Database Table
To actually catch and store the data your SDK captures, you need a database table mapped to the specific JSON payload. 

1. Create a project on [Supabase](https://supabase.com).
2. Open the SQL Editor in your Supabase dashboard.
3. Run the SQL schema in `supabase/schema.sql` to create your `events` table. (We use JSONB columns so you can change the payload later without breaking your database).

### 4. Deploy the Ingestion API
The SDK cannot communicate directly to your database securely. So I have provided a pre-configured Supabase Edge Function that handles CORS and safely inserts the data.

1. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) and log in.
2. Open your terminal in the project's root folder and link this folder to your Supabase project:
   ```bash
   # You can find the project-ref in your Supabase dashboard URL
   supabase link --project-ref <your-project-ref>
   ```
3. Deploy the ingestion function (note: this bypasses JWT checks so the public SDK can freely send data):
   ```bash
   supabase functions deploy collect
   ```
4. Retrieve the endpoint URL from the dashboard and use it to update your endpoint from Step 1. The link will be given to you in the terminal (e.g. https://supabase.com/dashboard/project/<your-project-ref>/functions).


### 5. View Your Live Data
That's it! Your UX tracker is now fully operational. As users interact with your application, you will immediately see live UX analytics data populate the `events` table inside your Supabase dashboard.

---

## Privacy, Security and Performance Defaults
By default, the SDK heavily prioritises user privacy:
- **`Password` and `hidden` inputs** are strictly ignored.
- **Credit Card** inputs (`autocomplete="cc-*"`) are ignored.
- **Emails and Numbers** inside clicked text are scrubbed and replaced with `[EMAIL]` and `[NUMBER]` before being sent to your database.
- Elements with the `.heuric-ignore` class are completely ignored by the click tracker.
- The SDK uses `navigator.sendBeacon` with `text/plain` blobs to bypass aggressive CORS preflights, ensuring your event batches arrive safely even on cross-origin requests.

---

## Testing Locally

If you want to quickly test how the SDK behaves without installing it in a full React application, we provide a standalone test playground.

1. Start a local server in the project root (try `python3 -m http.server 3456` because browsers usually block modules from loading with **file://** protocol).
2. Open `http://localhost:3456/test.html` in your browser.
3. At the bottom of the file, replace the `endpoint` with a testing webhook (like [Webhook.site](https://webhook.site/)) (or just right-click > Inspect Element > Network).
4. Click around the page, scroll down, and watch your webhook site or browser's Network tab for POST requests.


