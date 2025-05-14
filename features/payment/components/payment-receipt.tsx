"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import type { PaymentRecord } from '../types/payment-types';
import { formatCurrency, formatDate, getReceiptNumber } from '../utils/receipt-utils';

interface PaymentReceiptProps {
  payment: PaymentRecord;
  className?: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  payment, 
  className = '' 
}) => {
  // Get receipt number (either from payment or generate one)
  const receiptNumber = getReceiptNumber(payment);
  
  // Helper for status badge
  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Succeeded
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card id="payment-receipt" className={`print:shadow-none ${className}`}>
      <CardContent className="p-6 print:p-0">
        <div className="flex flex-col space-y-6">
          {/* Header with Logo */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative h-12 w-12 mr-3">
                <Image 
                  src="/icon.png" 
                  alt="1Tech Academy" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">1Tech Academy</h2>
                <p className="text-sm text-muted-foreground">Payment Receipt</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Receipt #: {receiptNumber}</p>
              <p className="text-sm text-muted-foreground">
                Date: {formatDate(payment.createdAt)}
              </p>
            </div>
          </div>
          
          <Separator />
          
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Information</h3>
              <p className="font-medium">Transaction ID: {payment.providerReference}</p>
              <p>Payment Method: {payment.paymentMethod} {payment.cardType && `(${payment.cardType}${payment.last4 ? ` **** ${payment.last4}` : ''})`}</p>
              <p>Status: {getStatusBadge(payment.status)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Billing Details</h3>
              {payment.billingDetails ? (
                <>
                  <p className="font-medium">{payment.billingDetails.name}</p>
                  <p>{payment.billingDetails.email}</p>
                  {payment.billingDetails.phone && <p>{payment.billingDetails.phone}</p>}
                  {payment.billingDetails.address && <p>{payment.billingDetails.address}</p>}
                </>
              ) : (
                <p>{payment.userName || payment.userId}</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Items */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Items</h3>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">Item</th>
                    <th className="px-4 py-2 text-right text-sm">Qty</th>
                    <th className="px-4 py-2 text-right text-sm">Unit Price</th>
                    <th className="px-4 py-2 text-right text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.receiptItems && payment.receiptItems.length > 0 ? (
                    payment.receiptItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(item.unitPrice, payment.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(item.totalPrice, payment.currency)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">{payment.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right">1</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr className="border-t">
                    <td colSpan={3} className="px-4 py-2 text-right font-medium">Total</td>
                    <td className="px-4 py-2 text-right font-bold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-6 print:mt-10">
            <p>Thank you for your payment!</p>
            <p>For any questions, please contact support@1techacademy.com</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
