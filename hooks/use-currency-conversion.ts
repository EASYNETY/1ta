// src/hooks/use-currency-conversion.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// Mock exchange rate API call - replace with your actual API endpoint
async function fetchExchangeRateAPI(base: string, target: string): Promise<number | null> {
    console.log(`Fetching ${base} to ${target} rate... (using mock)`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // In real app:
    // try {
    //   const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    //   if (!response.ok) throw new Error('Network response was not ok');
    //   const data = await response.json();
    //   return data.rates[target] ?? null;
    // } catch (error) {
    //   console.error("Failed to fetch exchange rate:", error);
    //   return null;
    // }
    return 1550.75; // Example mock rate
}

export function useCurrencyConversion(baseCurrency: string = 'USD', targetCurrency: string = 'NGN') {
    const [rate, setRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        fetchExchangeRateAPI(baseCurrency, targetCurrency)
            .then(fetchedRate => {
                if (isMounted) {
                    setRate(fetchedRate);
                }
            })
            .catch(err => {
                 if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch rate');
                    console.error(err);
                 }
            })
            .finally(() => {
                 if (isMounted) {
                    setIsLoading(false);
                 }
            });

        return () => {
            isMounted = false; // Cleanup function to prevent state updates on unmounted component
        };
    }, [baseCurrency, targetCurrency]); // Re-fetch if currencies change

    const convert = useCallback((amount: number): number | null => {
        if (rate === null || amount === undefined) return null;
        return amount * rate;
    }, [rate]);

    const formatTargetCurrency = useCallback((amount: number | null): string => {
        if (amount === null) return 'N/A'; // Or a placeholder/loading indicator
         try {
            return new Intl.NumberFormat(`en-${targetCurrency.substring(0, 2)}`, { // Attempt locale based on target
                style: "currency",
                currency: targetCurrency,
                minimumFractionDigits: 2,
            }).format(amount);
         } catch (e) {
             // Fallback formatting if locale/currency code is invalid
             return `${targetCurrency} ${amount.toFixed(2)}`;
         }
    }, [targetCurrency]);

    const formatBaseCurrency = useCallback((amount: number): string => {
         try {
            return new Intl.NumberFormat(`en-${baseCurrency.substring(0, 2)}`, { // Attempt locale based on base
                style: "currency",
                currency: baseCurrency,
                minimumFractionDigits: 2,
            }).format(amount);
        } catch (e) {
             return `${baseCurrency} ${amount.toFixed(2)}`;
        }
    }, [baseCurrency]);

    return {
        rate,
        isLoading,
        error,
        convert,
        formatTargetCurrency,
        formatBaseCurrency,
    };
}