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
    const url = new URL(domain);
    return url.hostname;
  }

  // Remove any potential protocol parts if someone accidentally included them
  const cleanDomain = domain.replace(/^(https?:\/\/)/, '');

  // If it's a custom domain like checkout.viulet.com, use it directly
  if (cleanDomain === 'checkout.viulet.com' || cleanDomain.includes('.') && !cleanDomain.includes('.myshopify.com')) {
    return cleanDomain;
  }

  // Make sure it has .myshopify.com for standard Shopify domains
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
  // Attempt actual API call (will run in both dev and prod)
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

    // Make the API request directly to Shopify
    const apiUrl = `https://${formattedDomain}/api/2023-07/graphql.json`;
    console.log(`Making inventory request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
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

    // Use direct checkout URL for development to avoid API calls
    if (process.env.NODE_ENV === 'development') {
      console.log('Using direct checkout URL in development mode');
      const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
      window.location.href = url;
      return url;
    }

    // Production checkout: Attempt API call
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

    // Make the API request directly to Shopify
    const apiUrl = `https://${formattedDomain}/api/2023-07/graphql.json`;
    const response = await fetch(apiUrl, {
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
      // Fallback to direct checkout URL
      const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
      window.location.href = url;
      return url;
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
      // Fallback to direct checkout URL
      const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
      window.location.href = url;
      return url;
    }

    // Check for errors
    if (result.errors) {
      console.error('Shopify API Error:', JSON.stringify(result.errors));
      // Fallback to direct checkout URL
      const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
      window.location.href = url;
      return url;
    }

    // Check for user errors
    if (result.data?.cartCreate?.userErrors?.length > 0) {
      console.error('Cart Creation Errors:', JSON.stringify(result.data.cartCreate.userErrors));
      // Fallback to direct checkout URL
      const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
      window.location.href = url;
      return url;
    }

    // Get the checkout URL from the cart
    const checkoutUrl = result.data?.cartCreate?.cart?.checkoutUrl;

    if (checkoutUrl) {
      // Redirect to the checkout URL
      window.location.href = checkoutUrl;
      return checkoutUrl;
    } else {
      console.error('Checkout creation failed: No checkout URL in response', JSON.stringify(result));
      // Fallback to direct checkout URL
      const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
      window.location.href = url;
      return url;
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    // Fallback to direct checkout URL
    const formattedDomain = formatDomain(STORE_DOMAIN);
    const url = `https://${formattedDomain}/cart/${PRODUCT_VARIANT_ID}:1`;
    window.location.href = url;
    return url;
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