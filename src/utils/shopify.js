/**
 * Shopify Storefront API Integration
 * Handles direct checkout creation and redirection
 */

// Configuration - Replace these with your actual values
let STORE_DOMAIN = 'YOUR_STORE_DOMAIN.myshopify.com';
let STOREFRONT_ACCESS_TOKEN = 'YOUR_STOREFRONT_ACCESS_TOKEN';
let PRODUCT_VARIANT_ID = 'YOUR_PRODUCT_VARIANT_ID';

/**
 * Format the domain to ensure proper structure
 * @param {string} domain - The Shopify store domain
 * @returns {string} Properly formatted domain
 */
function formatDomain(domain) {
  // If it's already a full URL, return it
  if (domain.startsWith('http')) {
    return domain;
  }

  // Remove any potential protocol parts if someone accidentally included them
  const cleanDomain = domain.replace(/^(https?:\/\/)/, '');

  // Make sure it has .myshopify.com
  if (!cleanDomain.includes('.myshopify.com')) {
    return `${cleanDomain}.myshopify.com`;
  }

  return cleanDomain;
}

/**
 * Fetches the available inventory for a product variant
 * @returns {Promise<number|null>} The available quantity or null if there was an error
 */
export async function getInventoryQuantity() {
  try {
    // Ensure the domain is correctly formatted
    const formattedDomain = formatDomain(STORE_DOMAIN);

    // Convert raw variant ID to Shopify global ID format
    const globalId = PRODUCT_VARIANT_ID.includes('gid://')
      ? PRODUCT_VARIANT_ID
      : `gid://shopify/ProductVariant/${PRODUCT_VARIANT_ID}`;

    const query = `
      query {
        node(id: "${globalId}") {
          ... on ProductVariant {
            quantityAvailable
          }
        }
      }
    `;

    // Make the API request with updated API version
    const response = await fetch(`https://${formattedDomain}/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('Shopify API responded with status:', response.status);
      return null;
    }

    const result = await response.json();

    // Check for errors
    if (result.errors) {
      console.error('Shopify API Error:', JSON.stringify(result.errors));
      return null;
    }

    // Return the available quantity
    const quantityAvailable = result.data?.node?.quantityAvailable;

    // If the quantity is undefined or null, return null
    if (quantityAvailable === undefined || quantityAvailable === null) {
      console.warn('No quantity available data found in response');
      return null;
    }

    return quantityAvailable;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return null;
  }
}

/**
 * Creates a checkout on Shopify and redirects to the checkout URL
 * @returns {Promise<string|null>} The checkout URL or null if there was an error
 */
export async function createCheckoutAndRedirect() {
  try {
    // Ensure the domain is correctly formatted
    const formattedDomain = formatDomain(STORE_DOMAIN);

    console.log('Creating checkout with:', {
      STORE_DOMAIN: formattedDomain,
      TOKEN_LENGTH: STOREFRONT_ACCESS_TOKEN.length,
      PRODUCT_VARIANT_ID
    });

    // Convert raw variant ID to Shopify global ID format
    const globalId = PRODUCT_VARIANT_ID.includes('gid://')
      ? PRODUCT_VARIANT_ID
      : `gid://shopify/ProductVariant/${PRODUCT_VARIANT_ID}`;

    // Updated to use cartCreate mutation for newer API versions
    const query = `
      mutation {
        cartCreate(
          input: {
            lines: [
              {
                quantity: 1
                merchandiseId: "${globalId}"
              }
            ]
          }
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
    `;

    // Make the API request with updated API version
    const response = await fetch(`https://${formattedDomain}/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    // Check for non-OK response before parsing
    if (!response.ok) {
      console.error('Shopify API responded with status:', response.status);
      return null;
    }

    // Log the raw response for debugging
    const responseText = await response.text();
    console.log('Raw Shopify response:', responseText);

    // Parse the response text
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return null;
    }

    // Check for errors
    if (result.errors) {
      console.error('Shopify API Error:', JSON.stringify(result.errors));
      return null;
    }

    // Check for user errors
    if (result.data?.cartCreate?.userErrors?.length > 0) {
      console.error('Cart Creation Errors:', JSON.stringify(result.data.cartCreate.userErrors));
      return null;
    }

    // Get the checkout URL from the cart
    const checkoutUrl = result.data?.cartCreate?.cart?.checkoutUrl;

    if (checkoutUrl) {
      // Redirect to the checkout URL
      window.location.href = checkoutUrl;
      return checkoutUrl;
    } else {
      console.error('Checkout creation failed: No checkout URL in response', JSON.stringify(result));
      return null;
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    return null;
  }
}

/**
 * Config setter for Shopify credentials
 * Can be used to set the credentials dynamically
 */
export function configureShopify(storeDomain, accessToken, variantId) {
  if (storeDomain) STORE_DOMAIN = formatDomain(storeDomain);
  if (accessToken) STOREFRONT_ACCESS_TOKEN = accessToken;
  if (variantId) PRODUCT_VARIANT_ID = variantId;
} 