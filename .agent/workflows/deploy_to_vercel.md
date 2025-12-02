---
description: Deploy Next.js App to Vercel
---

# How to Deploy to Vercel

Since your project is already on Git (GitHub/GitLab/Bitbucket), deploying to Vercel is the easiest and recommended way for Next.js applications.

## Prerequisites
- A [Vercel Account](https://vercel.com/signup) (You can log in with your GitHub account).
- Your code pushed to a Git repository.

## Steps

1.  **Go to Vercel Dashboard**: Log in to [vercel.com](https://vercel.com).
2.  **Add New Project**: Click the "Add New..." button and select "Project".
3.  **Import Git Repository**:
    - You should see your Git repository listed on the left.
    - Click "Import" next to your `aunt_game` (or whatever you named it) repository.
4.  **Configure Project**:
    - **Framework Preset**: It should automatically detect `Next.js`.
    - **Root Directory**: **IMPORTANT!** Click "Edit" and select `next-app` as the root directory, because your Next.js app is inside this subfolder.
5.  **Deploy**: Click the "Deploy" button.

Vercel will build your project and give you a public URL (e.g., `https://your-project-name.vercel.app`) in about a minute.

## Alternative: Deploy from Command Line

If you prefer using the terminal:

1.  Open your terminal in `d:\side_project\aunt_game\next-app`.
2.  Run `npx vercel` (or just `vercel` if installed globally).
3.  Follow the prompts:
    - Set up and deploy? `Y`
    - Which scope? (Select your account)
    - Link to existing project? `N`
    - Project name? (Press Enter)
    - Directory? (Press Enter)
    - Want to modify settings? `N`
4.  It will deploy and give you a Production URL.
