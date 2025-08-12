'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PaymentMethodSelector from '../components/PaymentMethodSelector';



export default function SignatureStatusPage() {
  const searchParams = useSearchParams();
  const signatureRequestId = searchParams.get('signatureRequestId');
  const signatureLink = searchParams.get('signatureLink');

  console.log('signatureRequestId:', signatureRequestId);

  const [status, setStatus] = useState<string>('waiting');
  const [isSigned, setIsSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const ref = searchParams.get('ref'); // referral code
  const userId = searchParams.get('userId'); // customerId

  useEffect(() => {
    if (!signatureRequestId) return;

    const interval = setInterval(async () => {
      try {
        const url = `/api/yousign/status?signatureRequestId=${encodeURIComponent(signatureRequestId!)}`;
        const res = await fetch(url);
        const data = await res.json();

        console.log('data', data); // <-- DEBUG
        console.log('data.status', data.status); // <-- DEBUG
        
        if (!res.ok) {
          console.error('Response not ok:', res.status);
          return;
        }

        if (!res.ok) throw new Error(data.error || 'Failed to fetch signing status');

        setStatus(data.status);

        if (data.status === 'done') {
          clearInterval(interval);
          setIsSigned(true); // <-- Button activation
        }
      } catch (e) {
        console.error('Error checking signing status:', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [signatureRequestId]);

const handleContinue = async () => {
  setLoading(true);

  // Get product selection parameters from URL
  const location = searchParams.get('location');
  const productType = searchParams.get('productType');
  const slaTier = searchParams.get('slaTier');

  try {
    // If user has selected a saved payment method, create subscription directly
    if (selectedPaymentMethod && userId) {
      const res = await fetch('/api/create-subscription-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref,
          location,
          productType,
          slaTier,
          customerId: userId,
          paymentMethodId: selectedPaymentMethod
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to success page
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/success`;
      } else {
        alert('Error creating subscription: ' + (data.error || 'Unknown error'));
        setLoading(false);
      }
    } else {
      // Use standard checkout flow for new payment methods
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref,
          location,
          productType,
          slaTier,
          customerId: userId,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating a session');
        setLoading(false);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing your request');
    setLoading(false);
  }
};

  const handlePaymentMethodSelect = (paymentMethodId: string | null) => {
    setSelectedPaymentMethod(paymentMethodId);
  };

  if (!signatureRequestId || !signatureLink) {
    return <p>Error: no ID or link</p>;
  }

  return (
    <div  style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Signing of the document</h1>
      <p>
        Please identify yourself and sign the contract.
      </p>
      <a href={signatureLink} target="_blank" rel="noopener noreferrer" style={{fontSize: '20px' }}>
        Click here to proceed to signing the document.
      </a>
      <p style={{ color: 'red', fontWeight: 'bold', fontSize: '30px' }}>After signing the document, return to this page.</p>
      
      <p style={{fontSize: '20px' }}>
        Current status: <strong>{status}</strong>
      </p>

      {isSigned && (
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'green', fontWeight: 'bold' }}>The document has been signed!</p>
          
          {userId && (
            <div style={{ margin: '1.5rem 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              <PaymentMethodSelector
                customerId={userId}
                onPaymentMethodSelect={handlePaymentMethodSelect}
              />
            </div>
          )}
          
          <button
            onClick={handleContinue}
            disabled={loading || (userId && !selectedPaymentMethod)}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: loading || (userId && !selectedPaymentMethod) ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading || (userId && !selectedPaymentMethod) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
