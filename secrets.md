# Environment Variables Guide

This file provides a template for the environment variables required by the FeatherLiteBooks application.

## `.env` File (`DO NOT COMMIT THIS FILE`)

Create a `.env` file in the root of your project and add your actual Supabase credentials and any other secrets.

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL="YOUR_ACTUAL_SUPABASE_URL"
EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_ACTUAL_SUPABASE_ANON_KEY"

# Add other environment variables here as needed
```

**Important:**
- Replace `"YOUR_ACTUAL_SUPABASE_URL"` with your project's Supabase URL.
- Replace `"YOUR_ACTUAL_SUPABASE_ANON_KEY"` with your project's Supabase Anon Key.
- The `.env` file is listed in `.gitignore` and should **NEVER** be committed to your repository.

## `.env.example` File (`COMMIT THIS FILE`)

Create a `.env.example` file in the root of your project. This file serves as a template for other developers and for CI/CD environments. It should list all required environment variables with placeholder or example values, but **NO REAL SECRETS**.

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL="your-supabase-url-here.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"

# Add other environment variables here as needed
```

This file *should* be committed to your repository. 