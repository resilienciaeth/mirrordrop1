# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Mirrordrop1

## Shopify Integration

The landing page includes integration with Shopify's Storefront API to handle direct checkout. When a "Buy Now" button is clicked, it creates a checkout session and redirects to the Shopify-hosted checkout URL.

### Configuration

To configure the Shopify integration:

1. Create a `.env` file in the root directory of the project with the following variables:

```
# Shopify Storefront API Credentials
REACT_APP_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
REACT_APP_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID=your-product-variant-id
```

2. Replace the placeholder values with your actual Shopify credentials:
   - `REACT_APP_SHOPIFY_STORE_DOMAIN`: Your Shopify store domain (e.g., your-store.myshopify.com)
   - `REACT_APP_SHOPIFY_STOREFRONT_TOKEN`: Your Shopify Storefront Access Token (read-only)
   - `REACT_APP_SHOPIFY_PRODUCT_VARIANT_ID`: The ID of the product variant you want to sell

Alternatively, you can directly modify the values in `src/components/ShopifyConfig.js`.

### Security Notes

- Make sure your Storefront Access Token is read-only and has only the Storefront API scope for security.
- Never expose your Shopify Admin API keys in the frontend code.
- The product should have available inventory or checkout will fail.

### How It Works

When a "Buy Now" button is clicked:

1. A checkout session is created with the Shopify Storefront API
2. The user is redirected to the Shopify-hosted checkout page
3. Shopify handles the rest of the checkout process (payment, shipping, etc.)

No cart page or quantity selection is needed - it's a direct "Buy Now" flow with quantity of 1.
