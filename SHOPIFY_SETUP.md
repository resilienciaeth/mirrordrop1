# Shopify Integration Setup

This document provides instructions for setting up the Shopify integration for the Mirror Drop website.

## Setting Up Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```
# Shopify Storefront API Credentials
# Your Shopify store domain (just the subdomain part or full domain with .myshopify.com)
REACT_APP_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

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
  (isDevMode ? "your-actual-store.myshopify.com" : "");
const accessToken =
  process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN ||
  (isDevMode ? "your-actual-storefront-token" : "");
const variantId =
  process.env.REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID ||
  (isDevMode ? "46438760612078" : "");
```

## Troubleshooting CORS Issues

If you're experiencing CORS errors:

1. **Verify Domain Format**: Make sure your Shopify store domain is in the correct format and ends with `.myshopify.com`

2. **Check Permissions**: Ensure your Storefront API token has at least `read_products` and `read_inventory` scopes

3. **For Local Development**:

   - You can install a CORS browser extension to bypass CORS restrictions during development
   - Or use a CORS proxy service

4. **Initial Setup for the Counter**:
   - When you first set up your Shopify store, make sure the inventory for your product is set to 100 items
   - As items are sold, the inventory will decrease and the counter will show "X/100 Mirrors Claimed"

## Getting Shopify Credentials

1. **Shopify Store Domain**: This is your store's myshopify domain (e.g., `your-store.myshopify.com`)

2. **Storefront API Token**:

   - Go to your Shopify Admin
   - Navigate to Apps > Develop apps > Create an app
   - Name it "Mirror Drop" or something recognizable
   - Go to "API credentials" and select the Storefront API
   - Configure the scopes to include at least `read_products` and `read_inventory`
   - Generate the storefront access token

3. **Product Variant ID**:
   - Your product variant ID is: `46438760612078`
   - This raw ID will work fine as our code automatically converts it to the global ID format
   - If you need to check other variants, you can find the variant ID in the URL when editing a product variant in Shopify Admin
