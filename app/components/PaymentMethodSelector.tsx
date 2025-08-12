'use client';

import { useEffect, useState } from 'react';

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    funding: string;
  };
  billingDetails: {
    email?: string;
    name?: string;
    address?: any;
  };
}

interface PaymentMethodSelectorProps {
  customerId: string;
  onPaymentMethodSelect: (paymentMethodId: string | null) => void;
}

export default function PaymentMethodSelector({ customerId, onPaymentMethodSelect }: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`/api/payment-methods/${customerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment methods');
        }
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
        
        // Auto-select first payment method only if none is currently selected
        if (data.paymentMethods && data.paymentMethods.length > 0 && !selectedMethod) {
          setSelectedMethod(data.paymentMethods[0].id);
          onPaymentMethodSelect(data.paymentMethods[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [customerId, onPaymentMethodSelect]);

  const handleSelectionChange = (paymentMethodId: string) => {
    setSelectedMethod(paymentMethodId);
    onPaymentMethodSelect(paymentMethodId);
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Loading saved payment methods...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>;
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        No saved payment methods. You'll need to add a new payment method during checkout.
      </div>
    );
  }
// ----------------- NEW
  const handleNewPaymentMethodCreate = async () => {
    try {
      // Get necessary parameters from URL or use defaults
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || '';
      const location = urlParams.get('location') || 'EU';
      const productType = urlParams.get('productType') || 'Subscription';
      const slaTier = urlParams.get('slaTier') || '';
      
      // Subscription is always included based on productType selection

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          ref,
          location,
          productType,
          slaTier,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Unexpected error occurred while creating payment method.');
    }
  };


  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Select Payment Method</h3>
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => handleSelectionChange(method.id)}
              className="mr-3"
            />
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <span className="font-medium">{method.card.brand.toUpperCase()}</span>
                <span className="ml-2">•••• {method.card.last4}</span>
                <span className="ml-2 text-gray-500">
                  Expires {method.card.expMonth}/{method.card.expYear}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>


        <button
                onClick={handleNewPaymentMethodCreate} 
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                Creat new Payment method
        </button>
    </div>
  );
}