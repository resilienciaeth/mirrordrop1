import React, { useState, useEffect } from 'react';
import { getInventoryQuantity } from '../utils/shopify';

/**
 * Component to display claimed inventory as a countdown (X/100)
 */
const InventoryCount = ({ className }) => {
    const [soldCount, setSoldCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Total number of mirrors in the limited edition
    const TOTAL_MIRRORS = 100;
    // Number of claimed items to show when API fails
    const FALLBACK_CLAIMED = 8;

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const availableInventory = await getInventoryQuantity();

                if (availableInventory !== null) {
                    // Calculate sold count (total - available)
                    // Make sure we don't exceed total if inventory is somehow negative
                    const sold = Math.min(TOTAL_MIRRORS, Math.max(0, TOTAL_MIRRORS - availableInventory));
                    setSoldCount(sold);
                    setError(null); // Clear any previous errors
                } else {
                    setError('Unable to fetch inventory');

                    // If we have a previous sold count, keep using it
                    if (soldCount === null) {
                        setSoldCount(FALLBACK_CLAIMED);
                    }
                }
            } catch (err) {
                setError(`Error fetching inventory data: ${err.message}`);
                console.error('Inventory fetch error:', err);

                // If we have a previous sold count, keep using it
                if (soldCount === null) {
                    setSoldCount(FALLBACK_CLAIMED);
                }

                // Try again a few times with increasing delay
                if (retryCount < 3) {
                    const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                    console.log(`Will retry inventory fetch in ${retryDelay / 1000}s`);

                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        fetchInventory();
                    }, retryDelay);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();

        // Refresh every few minutes
        const intervalId = setInterval(fetchInventory, 5 * 60 * 1000); // every 5 minutes

        return () => clearInterval(intervalId);
    }, [retryCount, soldCount]);

    // During loading, show last known value or placeholder
    if (loading && soldCount === null) {
        return <span className={className}>--/100</span>;
    }

    // Use the current sold count whether there's an error or not
    // This gives us fallback behavior
    return <span className={className}>{soldCount}/{TOTAL_MIRRORS}</span>;
};

export default InventoryCount; 