// src/hooks/use-exchange-rate.ts
'use client';

import { useState, useEffect } from 'react';

// Mock API call - replace with your actual fetch logic
async function fetchMockExchangeRate(base: string, target: string): Promise<number | null> {
    console.log(`Simulating fetch for ${base}_${target}...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

    // Simulate potential API error
    // if (Math.random() > 0.8) {
    //     console.error("Simulated API error fetching exchange rate.");
    //     return null;
    // }

    // Return a slightly randomized mock rate for demo purposes
    const baseRate = 1450 + Math.random() * 100; // Example: Rate fluctuates around 1500
    return baseRate;
}


interface UseExchangeRateResult {
    rate: number | null;
    isLoading: boolean;
    error: string | null;
}

// Hook to manage fetching and storing the exchange rate
export function useExchangeRate(baseCurrency = 'USD', targetCurrency = 'NGN'): UseExchangeRateResult {
    const [rate, setRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true; // Prevent state updates on unmounted component

        const getRate = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Replace fetchMockExchangeRate with your actual API call
                const fetchedRate = await fetchMockExchangeRate(baseCurrency, targetCurrency);

                if (isMounted) {
                    if (fetchedRate !== null) {
                        setRate(fetchedRate);
                    } else {
                       setError("Failed to fetch exchange rate.");
                    }
                }
            } catch (err) {
                 if (isMounted) {
                    console.error("Error fetching exchange rate:", err);
                    setError("An error occurred while fetching the rate.");
                 }
            } finally {
                 if (isMounted) {
                    setIsLoading(false);
                 }
            }
        };

        getRate();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [baseCurrency, targetCurrency]); // Re-fetch if currencies change

    return { rate, isLoading, error };
}
