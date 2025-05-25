# MedBlocks_Assignment

## Setup

To get the project running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Aakashptw/MedBlocks_Assignment.git
    cd MedBlocks_Assignment
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173/` (or another port if 5173 is in use).

## Usage

Once the development server is running, you can access the patient registration application in your browser. (Provide more specific usage instructions here if applicable to your application, e.g., "Fill out the form and click submit.")

## Challenges Faced During Development

During the development and deployment process, we encountered several challenges, primarily related to deploying the Vite React application to Vercel:

1.  **Vercel Deployment Permissions:** Initial attempts to build on Vercel failed with a "Permission denied" error when executing the build script `npx --no-install vite build`. This was resolved by changing the build command in `package.json` to simply `vite build`.
2.  **Git Merge Conflicts:** A significant challenge was resolving merge conflicts that occurred when pulling changes from the remote repository. These conflicts were widespread, particularly in the `node_modules` directory and `package-lock.json`. The conflicts were resolved by performing a hard reset of the local repository to match the remote `main` branch, discarding local changes, followed by a clean installation of dependencies.
3.  **Incorrect MIME Type on Vercel:** After resolving merge conflicts and deploying, the application deployed on Vercel appeared blank. Investigating the browser console revealed errors indicating that JavaScript module scripts were being served with a `text/html` MIME type instead of `application/javascript`. This issue was addressed by adding a `vercel.json` file with specific build and route configurations, including explicit handling for assets, which helped Vercel serve the static files correctly.
