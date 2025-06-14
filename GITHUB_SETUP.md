# GitHub Actions Setup Guide

This guide will help you set up GitHub Actions for automated deployment of your serverless contact form API.

## Prerequisites

✅ **Already completed:**
- GitHub Actions workflow file (`.github/workflows/deploy.yml`) is configured
- Local development environment is working
- GCP project (`serverless-462906`) is set up
- Tests are passing

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. Navigate to GitHub Secrets
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

### 2. Add Required Secrets

#### **GCP_PROJECT_ID**
- **Name:** `GCP_PROJECT_ID`
- **Value:** `serverless-462906`

#### **GCP_SA_KEY** (Service Account Key)
- **Name:** `GCP_SA_KEY`
- **Value:** Your GCP service account JSON key (see instructions below)

#### **SENDGRID_API_KEY**
- **Name:** `SENDGRID_API_KEY`
- **Value:** Your SendGrid API key (starts with `SG.`)

#### **ADMIN_EMAIL**
- **Name:** `ADMIN_EMAIL`
- **Value:** `admin@yourcompany.com` (or your actual admin email)

#### **FROM_EMAIL**
- **Name:** `FROM_EMAIL`
- **Value:** `noreply@yourcompany.com` (or your actual from email)

#### **COMPANY_NAME**
- **Name:** `COMPANY_NAME`
- **Value:** `Your Company Name` (or your actual company name)

#### **CORS_ORIGIN**
- **Name:** `CORS_ORIGIN`
- **Value:** `https://yourwebsite.com` (your production website URL)

#### **CORS_ORIGIN_STAGING**
- **Name:** `CORS_ORIGIN_STAGING`
- **Value:** `https://staging.yourwebsite.com` (your staging website URL)

## Creating GCP Service Account Key

### Step 1: Create Service Account
```bash
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions" \
    --description="Service account for GitHub Actions deployment"
```

### Step 2: Grant Required Permissions
```bash
gcloud projects add-iam-policy-binding serverless-462906 \
    --member="serviceAccount:github-actions@serverless-462906.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding serverless-462906 \
    --member="serviceAccount:github-actions@serverless-462906.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding serverless-462906 \
    --member="serviceAccount:github-actions@serverless-462906.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

### Step 3: Create and Download Key
```bash
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@serverless-462906.iam.gserviceaccount.com
```

### Step 4: Add Key to GitHub Secrets
1. Open the `github-actions-key.json` file
2. Copy the entire JSON content
3. Add it as the `GCP_SA_KEY` secret in GitHub
4. **Delete the local file** for security: `del github-actions-key.json`

## Deployment Workflow

### Automatic Deployments
- **Staging:** Push to `develop` branch → deploys to `contact-form-api-staging`
- **Production:** Push to `main` branch → deploys to `contact-form-api`

### Manual Trigger
You can also trigger deployments manually from the GitHub Actions tab.

## Workflow Features

✅ **Testing:** Runs on Node.js 18.x and 20.x
✅ **Linting:** Code quality checks
✅ **Security:** Dependency audits
✅ **Coverage:** Code coverage reports
✅ **Staging:** Deploy to staging environment
✅ **Production:** Deploy to production with release creation

## Next Steps

1. **Create GitHub repository** (if not already done)
2. **Add all secrets** listed above
3. **Create service account** and add key
4. **Push code to GitHub**
5. **Create `develop` branch** for staging deployments
6. **Push to `main`** for production deployment

## Monitoring Deployments

- Check the **Actions** tab in GitHub to see deployment status
- View logs for any deployment issues
- Monitor your GCP Cloud Functions console for function health

## Troubleshooting

### Common Issues:
- **Permission denied:** Check service account permissions
- **Invalid secrets:** Verify all secrets are correctly formatted
- **Deployment timeout:** Check function memory/timeout settings
- **CORS errors:** Verify CORS_ORIGIN settings match your website

### Getting Help:
- Check GitHub Actions logs for detailed error messages
- Use `gcloud functions logs read contact-form-api` for runtime logs
- Verify secrets are properly set in GitHub repository settings
