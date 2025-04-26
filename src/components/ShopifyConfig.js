import { useEffect } from 'react';
import { configureShopify } from '../utils/shopify';

/**
 * Shopify Configuration Component
 * This component initializes the Shopify API credentials on mount
 * It doesn't render anything, it just sets up the configuration
 */
const ShopifyConfig = () => {
    useEffect(() => {
        // Get environment variables or use backups if in development mode
        const isDevMode = process.env.NODE_ENV === 'development';
        const storeDomain = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || (isDevMode ? 'your-store.myshopify.com' : '');
        const accessToken = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN || (isDevMode ? 'your-storefront-access-token' : '');
        const variantId = process.env.REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID || (isDevMode ? '46438760612078' : '');

        // Check if required environment variables are available
        const missingEnvVars = [];
        if (!process.env.REACT_APP_SHOPIFY_STORE_DOMAIN) missingEnvVars.push('REACT_APP_SHOPIFY_STORE_DOMAIN');
        if (!process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN) missingEnvVars.push('REACT_APP_SHOPIFY_STOREFRONT_TOKEN');
        if (!process.env.REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID) missingEnvVars.push('REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID');

        // Log configuration status
        if (isDevMode && missingEnvVars.length > 0) {
            console.warn(`Missing Shopify configuration: ${missingEnvVars.join(', ')}`);
            console.info(
                'To enable Shopify integration, create a .env file in the project root with the following variables:\n' +
                'REACT_APP_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com\n' +
                'REACT_APP_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token\n' +
                'REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID=46438760612078\n\n' +
                'For testing purposes, edit these values directly in ShopifyConfig.js'
            );
        } else {
            console.log('Environment variables:', {
                DOMAIN: process.env.REACT_APP_SHOPIFY_STORE_DOMAIN ? 'Found ✓' : 'Missing ✗',
                TOKEN: process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN ? 'Found ✓' : 'Missing ✗',
                VARIANT_ID: process.env.REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID ? 'Found ✓' : 'Missing ✗',
            });
        }

        // Configure Shopify with the provided credentials
        configureShopify(storeDomain, accessToken, variantId);

        console.log('Shopify configuration initialized with:', {
            storeDomain,
            tokenLength: accessToken ? accessToken.length : 0,
            variantIdExists: !!variantId,
        });
    }, []);

    // This component doesn't render anything
    return null;
};

export default ShopifyConfig; 