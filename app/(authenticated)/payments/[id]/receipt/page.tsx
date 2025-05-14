"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchPaymentById, 
  selectSelectedPayment, 
  selectSelectedPaymentStatus, 
  selectPaymentHistoryError 
} from '@/features/payment/store/payment-slice';
import { PageHeader } from '@/components/page-header';
import { PaymentReceipt } from '@/features/payment/components/payment-receipt';
import { ReceiptActions } from '@/features/payment/components/receipt-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const paymentId = params.id as string;
  const payment = useAppSelector(selectSelectedPayment);
  const status = useAppSelector(selectSelectedPaymentStatus);
  const error = useAppSelector(selectPaymentHistoryError);
  
  const isLoading = status === 'loading';
  
  useEffect(() => {
    if (paymentId) {
      dispatch(fetchPaymentById(paymentId));
    }
  }, [dispatch, paymentId]);
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <PageHeader
        title="Payment Receipt"
        description="View and download your payment receipt"
        actions={
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />
      
      {isLoading && (
        <div className="mt-6">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      )}
      
      {status === 'failed' && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Failed to load payment receipt. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'succeeded' && payment && (
        <div className="mt-6 space-y-4">
          <ReceiptActions 
            payment={payment} 
            receiptElementId="payment-receipt" 
            className="flex justify-end"
          />
          
          <PaymentReceipt payment={payment} />
        </div>
      )}
    </div>
  );
}
