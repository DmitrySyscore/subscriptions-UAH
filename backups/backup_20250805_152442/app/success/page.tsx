'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const referrerId = searchParams.get('referrer');

  useEffect(() => {
    async function fetchReferrerName() {
      if (!referrerId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/user-by-stripe-id?stripeId=${referrerId}`);
        if (!res.ok) throw new Error('Referrer not found');
        const data = await res.json();
        setDisplayName(data.name);
      } catch (err) {
        console.error('Error fetching referrer name:', err);
        setDisplayName(null);
      } finally {
        setLoading(false);
      }
    }

    fetchReferrerName();
  }, [referrerId]);

  const handleGoHome = () => {
    // Use window.location as fallback for router issues
    try {
      router.push('/');
    } catch (error) {
      console.error('Router push failed, using window.location:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">
        Congratulations! The process was successful
        {displayName && <span className="text-blue-600"> {displayName}</span>}
      </h1>

      <button
        onClick={handleGoHome}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
}
