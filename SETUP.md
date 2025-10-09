# Setup Guide

This guide will help you set up the Fridge Recipe App with all features including authentication.

## Quick Start (Anonymous Mode)

The app works without any setup - just open it in your browser and start adding ingredients! You'll need to provide a Groq API key through the settings UI.

## Full Setup (With Authentication)

To enable user accounts and cloud storage, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

### 2. Get API Keys

#### Groq API Key (Optional but Recommended)
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account
3. Create an API key
4. Copy the key (starts with `gsk_`)

#### Resend API Key (Required for Authentication)
1. Go to [Resend](https://resend.com)
2. Sign up for a free account (includes 100 emails/day free tier)
3. Add and verify your domain for sending emails
4. Create an API key
5. Copy the key (starts with `re_`)

### 3. Generate Security Keys

Generate random strings for JWT signing and encryption:

```bash
# On macOS/Linux
openssl rand -base64 32

# Run this twice to get two different keys
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Groq API (Optional - users can provide their own)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Resend Email Service (Required for magic links)
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Security Keys (Required for auth)
JWT_SECRET=your_first_random_string_here
ENCRYPTION_KEY=your_second_random_string_here
```

**Important**: 
- Use the domain you verified with Resend for `FROM_EMAIL`
- Keep your JWT_SECRET and ENCRYPTION_KEY secure and never commit them to git
- Generate new random strings for production

### 5. Run the Development Server

```bash
npm run dev
# or with Deno
deno run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Test Authentication

1. Click "Sign In / Sign Up" button
2. Enter your email address
3. Check your email for the magic link
4. Click the link to sign in
5. You should be redirected back to the app, now logged in!

## Deploying to Deno Deploy

### Prerequisites
- GitHub account
- Your repository pushed to GitHub

### Steps

1. Go to [Deno Deploy](https://dash.deno.com)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the branch to deploy
5. Configure environment variables in the Deno Deploy dashboard:
   - `GROQ_API_KEY` (optional)
   - `RESEND_API_KEY` (required)
   - `FROM_EMAIL` (required)
   - `JWT_SECRET` (required - use a different value than local)
   - `ENCRYPTION_KEY` (required - use a different value than local)
6. Deploy!

Deno Deploy automatically provides Deno KV storage - no additional configuration needed.

## Troubleshooting

### Magic Links Not Working

**Problem**: Not receiving magic link emails

**Solutions**:
- Verify your domain in Resend dashboard
- Check `FROM_EMAIL` matches your verified domain
- Check spam/junk folder
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery logs

**Problem**: "Email service not configured" error

**Solution**: Make sure both `RESEND_API_KEY` and `FROM_EMAIL` are set in your environment variables

### Authentication Issues

**Problem**: "Deno KV is not available" error

**Solution**: This feature requires running on Deno. Use `deno run dev` instead of `npm run dev` for local development, or deploy to Deno Deploy for production.

**Problem**: Session expires immediately

**Solution**: Check that `JWT_SECRET` is set and is a strong random string

**Problem**: Cannot decrypt API keys

**Solution**: Check that `ENCRYPTION_KEY` is set. If you change this key, existing encrypted data will be unreadable.

### Build Issues

**Problem**: Build fails with Deno namespace errors

**Solution**: This is expected - the app uses Deno-specific features that aren't available during Next.js build. These features work at runtime when deployed to Deno. The build should still complete successfully.

## Security Best Practices

### For Development
- Use `.env.local` (not `.env`) for local environment variables
- Never commit `.env.local` to git
- Use different keys for each environment

### For Production
- Use strong random strings for JWT_SECRET and ENCRYPTION_KEY
- Set up proper CORS if needed
- Use a verified domain for sending emails
- Monitor Resend email logs for abuse
- Consider implementing additional rate limiting
- Regularly rotate JWT_SECRET and ENCRYPTION_KEY (will require users to re-login)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No | Default Groq API key. Users can provide their own. |
| `RESEND_API_KEY` | Yes (for auth) | API key from Resend for sending emails. |
| `FROM_EMAIL` | Yes (for auth) | Verified email address for sending magic links. |
| `JWT_SECRET` | Yes (for auth) | Random string for signing JWT session tokens. |
| `ENCRYPTION_KEY` | Yes (for auth) | Random string for encrypting user API keys. |

## Getting Help

- Check the [API Documentation](./API.md) for endpoint details
- Review the [PWA Documentation](./PWA.md) for app installation
- Open an issue on GitHub for bugs or feature requests
