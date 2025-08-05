'use client';

import { useSearchParams } from 'next/navigation';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode: referralCode, // transfer ref в backend
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // redirection to Stripe Checkout
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Subscribe</h1>
      <button
        onClick={handleCheckout}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Proceed to payment
      </button>
    </div>
  );
}
