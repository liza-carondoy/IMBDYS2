# Engineering Inventory Management

React + Vite app with a dashboard, restock entry, pending requests, request status and a Supabase settings page.

## Run it
```
npm install
npm run dev
```
Open the local URL Vite prints (usually http://localhost:5173).

## Connect Supabase
1. In Supabase, open **SQL Editor** and run the script shown at the bottom of the app's **Settings** page (also in `src/lib/sql.js`).
2. In **Settings**, paste your Project URL and **anon** key (Supabase: Project settings, API).
3. Click **Test connection**, then **Save and connect**.

Without credentials the app stores sample data in the browser (localStorage). Credentials are saved in the browser too, so use the anon key only.

## Deploy
`npm run build` creates `dist/`. Import the repo into Vercel (framework preset: Vite) or upload `dist/` to any static host.

## Structure
```
src/
  main.jsx            entry point
  App.jsx             layout, navigation, data loading and actions
  styles.css
  lib/
    backend.js        Supabase and local-storage data layer, sample data
    sql.js            database setup script
    utils.js          helpers (formatting, CSV export, stock status)
  components/
    ui.jsx            Modal, Tag, Gauge
    ItemForm.jsx      add / edit item form
  pages/
    Dashboard.jsx  Restock.jsx  Pending.jsx  Status.jsx  Settings.jsx
```
