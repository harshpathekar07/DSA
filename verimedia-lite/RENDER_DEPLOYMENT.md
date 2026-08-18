# Deploying VeriMedia Lite on Render.com (Free)

This guide shows you how to deploy VeriMedia Lite to [Render](https://render.com) for free.

## Prerequisites
- A GitHub account.
- A Render.com account.
- Your project pushed to a GitHub repository.

## Steps

1. **Log in to Render.com** and go to your Dashboard.
2. Click on **New +** and select **Web Service**.
3. **Connect your GitHub repository** containing VeriMedia Lite.
4. **Configure the Web Service:**
   - **Name:** Choose a name for your service (e.g., `verimedia-lite`).
   - **Region:** Select a region close to you.
   - **Branch:** `main` (or your default branch).
   - **Runtime:** `Python 3`.
   - **Build Command:** `pip install -r requirements.txt`.
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. **Instance Type:** Select the **Free** instance type.
6. **Environment Variables (Optional):**
   - Click on "Advanced" and add your environment variables if you are using Sightengine:
     - `SIGHTENGINE_API_USER`: *your_api_user*
     - `SIGHTENGINE_API_SECRET`: *your_api_secret*
7. Click **Create Web Service**.

Render will now build and deploy your application. Once the build is complete, you can access your API using the provided `.onrender.com` URL.

*Note: The first time the local fallback model is used on Render, it will download the CLIP model weights. This might take a little time and use some RAM. If the free tier runs out of memory during this step, you may need to upgrade to a paid plan or stick to the Sightengine API.*
