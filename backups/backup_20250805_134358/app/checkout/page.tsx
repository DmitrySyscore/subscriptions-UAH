'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [signerFirstName, setSignerFirstName] = useState('');
  const [signerLastName, setSignerLastName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');

  const ref = searchParams.get('ref'); // referrer Id
  const router = useRouter();
  
  console.log('--Checkout/route.tsx executed');
  
  useEffect(() => {
    const fetchInviter = async () => {
      if (!ref) return;

      try {
        const res = await fetch(`/api/user-by-stripe-id?stripeId=${ref}`);
        const data = await res.json();

        if (res.ok && data?.name) {
          setInviterName(data.name);
        } else {
          setInviterName(null);
        }
      } catch (error) {
        console.error('Failed to fetch inviter info:', error);
        setInviterName(null);
      }
    };

    fetchInviter();
  }, [ref]);

  const handleCheckout = async () => {
   setLoading(true);
  
    try {
    const res = await fetch('/api/yousign/start-signing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref,
        signerFirstName,
        signerLastName,
        signerEmail
      }),
    });
    
    console.log ('app\checkout\page.tsx body', JSON.stringify({ ref, signerFirstName, signerLastName }));

    const data = await res.json();

    if (!res.ok || !data.signatureRequestId || !data.signatureLink) {
      alert('Error when starting the signature procedure');
      setLoading(false);
      return;
    }
    localStorage.setItem('referrer', ref || '');
    console.log('referrer from app\checkout\page.tsx', ref);

    // Redirect to an intermediate page that monitors the status of the signature
    // Get product selection parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const location = searchParams.get('location');
    const productType = searchParams.get('productType');
    const slaTier = searchParams.get('slaTier');
    const includeSubscription = searchParams.get('includeSubscription');
    const userId = searchParams.get('userId');

    const params = new URLSearchParams();
    params.set('signatureRequestId', data.signatureRequestId);
    params.set('signatureLink', data.signatureLink); // Don't double-encode
    if (ref) params.set('ref', ref);
    if (userId) params.set('userId', userId);
    if (location) params.set('location', location);
    if (productType) params.set('productType', productType);
    if (slaTier) params.set('slaTier', slaTier);
    if (includeSubscription) params.set('includeSubscription', includeSubscription);

    router.push(`/signature-status?${params.toString()}`);
  } catch (err) {
    console.error('Error when starting signature:', err);
    alert('An error has occurred');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Did someone invite you? Let's check...</h1>

      {ref ? (
        <p className="mb-4 text-sm">
          {inviterName
            ? <>You were invited by: <strong>{inviterName}</strong></>
            : 'Searching for the user who invited you...'}
        </p>
      ) : (
        <p className="mb-4 text-sm text-gray-600">
          Referral link was not used
        </p>
      )}


      <p className="mb-4 text-sm text-gray-600">
          <strong>Enter the details of the person signing the documents</strong>
      </p>

      <input
          id="signerFirstName"
          type="text"
          value={signerFirstName}
          onChange={(e) => setSignerFirstName(e.target.value)}
          placeholder="First name"
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
      />

      <input
          id="signerLastName"
          type="text"
          value={signerLastName}
          onChange={(e) => setSignerLastName(e.target.value)}
          placeholder="Last name"
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
      />

      <input
          id="signerEmail"
          type="text"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
      />


      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={handleCheckout}
        disabled={loading || (ref && !inviterName) || !signerFirstName || !signerLastName || !signerEmail}
      >
        {loading ? 'Loading...' : 'Proceed to signing documents'}
      </button>
    </div>
  );
}
