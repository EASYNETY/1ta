// features/accounting/components/AccountingDataProvider.tsx

"use client"

import React, { useEffect, ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    selectAccountingStatus,
    selectAccountingError,
    selectAccountingStats,
    selectCourseRevenues,
    selectMonthlyRevenueTrend,
    selectAccountingDebugInfo,
    fetchAccountingData,
    syncPaymentsFromAdmin,
} from "../store/accounting-slice"
import { selectAdminPayments, selectAdminPaymentsStatus } from "@/features/payment/store/adminPayments"

interface AccountingDataProviderProps {
    children: ReactNode
}

export function AccountingDataProvider({ children }: AccountingDataProviderProps) {
    const dispatch = useAppDispatch()
    
    // Selectors
    const accountingStatus = useAppSelector(selectAccountingStatus)
    const adminPayments = useAppSelector(selectAdminPayments)
    const adminStatus = useAppSelector(selectAdminPaymentsStatus)
    const debugInfo = useAppSelector(selectAccountingDebugInfo)

    // Data sync effect
    useEffect(() => {
        console.log('[AccountingDataProvider] Status check:', {
            accountingStatus,
            adminStatus,
            adminPaymentsCount: adminPayments?.length || 0,
            debugInfo,
        });

        // If accounting data is idle and we have admin payments, sync them
        if (accountingStatus === 'idle' && adminPayments && adminPayments.length > 0) {
            console.log('[AccountingDataProvider] Syncing admin payments to accounting:', adminPayments.length);
            dispatch(syncPaymentsFromAdmin(adminPayments));
        }

        // If both are idle, trigger initial fetch
        if (accountingStatus === 'idle' && adminStatus === 'idle') {
            console.log('[AccountingDataProvider] Both idle, triggering initial fetch');
            dispatch(fetchAccountingData());
        }
    }, [accountingStatus, adminStatus, adminPayments, dispatch, debugInfo]);

    // Debug effect - log when data changes
    useEffect(() => {
        if (debugInfo.paymentsCount > 0) {
            console.log('[AccountingDataProvider] Data updated:', debugInfo);
        }
    }, [debugInfo]);

    return <>{children}</>;
}

// HOC version for wrapping individual components
export function withAccountingData<P extends object>(
    Component: React.ComponentType<P>
): React.ComponentType<P> {
    const WrappedComponent = (props: P) => {
        return (
            <AccountingDataProvider>
                <Component {...props} />
            </AccountingDataProvider>
        );
    };
    
    WrappedComponent.displayName = `withAccountingData(${Component.displayName || Component.name})`;
    return WrappedComponent;
}

// Hook for components to get consistent accounting data
export function useAccountingData() {
    const dispatch = useAppDispatch();
    
    // Core selectors
    const status = useAppSelector(selectAccountingStatus);
    const error = useAppSelector(selectAccountingError);
    const stats = useAppSelector(selectAccountingStats);
    const courseRevenues = useAppSelector(selectCourseRevenues);
    const monthlyTrend = useAppSelector(selectMonthlyRevenueTrend);
    const debugInfo = useAppSelector(selectAccountingDebugInfo);
    
    // Admin data for fallback
    const adminPayments = useAppSelector(selectAdminPayments);
    
    // Refresh function
    const refreshData = () => {
        console.log('[useAccountingData] Manual refresh triggered');
        dispatch(fetchAccountingData());
    };

    // Sync function
    const syncFromAdmin = () => {
        if (adminPayments && adminPayments.length > 0) {
            console.log('[useAccountingData] Manual sync from admin triggered');
            dispatch(syncPaymentsFromAdmin(adminPayments));
        }
    };

    return {
        // Data
        stats,
        courseRevenues,
        monthlyTrend,
        
        // Status
        isLoading: status === 'loading',
        isError: status === 'failed',
        error,
        
        // Actions
        refreshData,
        syncFromAdmin,
        
        // Debug
        debugInfo,
    };
}
