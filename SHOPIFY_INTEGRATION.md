# Mirror Drop - Shopify Integration Documentation

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Data Integration](#data-integration)
4. [API Implementation](#api-implementation)
5. [Technical Details](#technical-details)
6. [Troubleshooting](#troubleshooting)

## Overview

Mirror Drop is a React-based web application that integrates with Shopify's Storefront API to manage product inventory and checkout processes for a limited edition mirror artwork collection. The integration handles real-time inventory tracking and provides a seamless checkout experience.

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Shopify Storefront API Credentials
REACT_APP_SHOPIFY_STORE_DOMAIN=checkout.viulet.com
REACT_APP_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID=46438760612078
```

### Configuration Requirements

1. Shopify Store Setup:
   - Initial inventory set to 100 items
   - Primary domain configured as `checkout.viulet.com`
   - Storefront API access token with required scopes:
     - `read_products`
     - `read_inventory`

## Data Integration

### Data Retrieved from Shopify

1. **Inventory Data**

   - Real-time inventory levels
   - Product variant information
   - Available quantity tracking

2. **Checkout Information**
   - Checkout session creation
   - Secure checkout URLs
   - Cart management

### Data Update Frequency

- Inventory counts refresh every 5 minutes
- Real-time checkout session creation
- Fallback mechanisms for API failures

## API Implementation

### Storefront API Endpoints

Base URL: `https://{STORE_DOMAIN}/api/2023-07/graphql.json`

#### 1. Inventory Query

```graphql
query {
  node(id: "${globalId}") {
    ... on ProductVariant {
      quantityAvailable
    }
  }
}
```

#### 2. Cart Creation

```graphql
mutation {
  cartCreate(
    input: { lines: [{ quantity: 1, merchandiseId: "${globalId}" }] }
  ) {
    cart {
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
```

### Authentication

- Uses Storefront Access Token
- Token included in request headers
- Read-only access for security

## Technical Details

### Development Mode

1. **Checkout Process**

   - Uses direct cart URL
   - Format: `https://checkout.viulet.com/cart/46438760612078:1`
   - CORS handling may require browser extension

2. **Inventory Tracking**
   - Real-time API calls
   - Fallback to default values if needed
   - Retry logic implemented

### Production Mode

1. **API Integration**

   - Full Storefront API implementation
   - Server-side proxy recommended
   - Automatic fallback mechanisms

2. **Error Handling**
   - Exponential backoff for retries
   - Graceful degradation
   - Maintains user experience

### Security Measures

1. **API Security**

   - Read-only access tokens
   - Environment variable storage
   - No client-side exposure

2. **Data Protection**
   - Secure checkout redirects
   - Protected API credentials
   - CORS security implementation

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Development: Use browser CORS extension
   - Production: Implement server-side proxy
   - Check domain configuration

2. **API Failures**

   - Verify environment variables
   - Check token permissions
   - Review API response logs

3. **Inventory Display Issues**
   - Confirm Shopify inventory settings
   - Check API response data
   - Verify refresh intervals

### Quick Fixes

1. **Environment Variables**

   - Double-check `.env` file presence
   - Verify variable names
   - Confirm token permissions

2. **Checkout Flow**

   - Clear browser cache
   - Verify product variant ID
   - Check Shopify domain settings

3. **Inventory Updates**
   - Refresh page
   - Check console for errors
   - Verify API connectivity

---

For additional support or questions, please refer to the project maintainers or Shopify documentation.
