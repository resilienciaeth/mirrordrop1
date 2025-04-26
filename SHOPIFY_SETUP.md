# Shopify Integration Setup

This document provides instructions for setting up the Shopify integration for the Mirror Drop website.

## Setting Up Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```
# Shopify Storefront API Credentials
# Your Shopify store domain (can be your custom domain or myshopify domain)
REACT_APP_SHOPIFY_STORE_DOMAIN=checkout.viulet.com

# Your Shopify Storefront API access token (must have read_products and read_inventory scopes)
REACT_APP_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token

# The ID of your product variant
# This will be converted to the proper Shopify global ID format automatically
REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID=46438760612078
```

## Quick Fix Option

If you're having trouble with environment variables, you can directly modify the credentials in:

1. Open `src/components/ShopifyConfig.js`
2. Update these lines with your actual Shopify credentials:

```javascript
const storeDomain =
  process.env.REACT_APP_SHOPIFY_STORE_DOMAIN ||
  (isDevMode ? "checkout.viulet.com" : "");
const accessToken =
  process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN ||
  (isDevMode ? "your-actual-storefront-token" : "");
const variantId =
  process.env.REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID ||
  (isDevMode ? "46438760612078" : "");
```

## CORS & API Calls

1.  **Development Mode (localhost)**:

    - The application now attempts to fetch the **real inventory count** directly from Shopify.
    - **Potential CORS Issue:** Because this is a direct browser call from `localhost` to your Shopify domain with a custom header, you might encounter CORS (Cross-Origin Resource Sharing) errors in the browser console.
    - **Workaround:** If you see CORS errors related to the inventory fetch, the easiest solution _for development only_ is to use a browser extension that disables CORS checks (e.g., search for "Allow CORS" or similar in your browser's extension store). Remember to disable this extension when not needed.

2.  **Production Mode**:
    - In a production build, the real API call is also attempted.
    - **Server-Side Proxy Recommended:** For a robust and secure production setup, it's highly recommended to implement a server-side proxy (e.g., using Netlify/Vercel functions). Your React app calls your proxy, and your proxy securely calls Shopify. This avoids all browser CORS limitations.

## Checkout Flow

1.  **In Development**:

    - To ensure reliability, the checkout button uses a direct cart link, bypassing the API:
    - `https://checkout.viulet.com/cart/46438760612078:1`

2.  **In Production**:
    - The app will attempt to use the Shopify Storefront API `cartCreate` mutation.
    - If that fails (e.g., due to CORS or other errors), it will fall back to the direct cart URL as a safety measure.

## Troubleshooting

- **CORS Errors (Inventory):** Use a browser CORS extension during development if needed.
- **CORS Errors (Production):** Implement a server-side proxy.
- **Redirect Issues:** Ensure `checkout.viulet.com` is the **Primary Domain** in Shopify Settings > Domains.
- **API Errors:** Double-check your Storefront Access Token and its permissions (`read_products`, `read_inventory`).

## Initial Setup for the Counter

- When you first set up your Shopify store, make sure the inventory for your product is set to 100 items.
- As items are sold, the inventory will decrease, and the counter should now reflect this in both development (if CORS allows) and production.

## Getting Shopify Credentials

1.  **Shopify Store Domain**: `checkout.viulet.com`
2.  **Storefront API Token**: (Ensure correct scopes: `read_products`, `read_inventory`)
3.  **Product Variant ID**: `46438760612078`
