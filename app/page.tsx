'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [ref, setRef] = useState('');
  const [userIdRef, setUserIdRef] = useState('');
  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [productType, setProductType] = useState('');
  const [slaTier, setSlaTier] = useState('');
  const router = useRouter();
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const requestId = localStorage.getItem('signatureRequestId');
    if (!requestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-signature?requestId=${requestId}`);
        const data = await res.json();
        if (data.signed) {
          setSigned(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking signature status:', error);
      }
    }, 5000); // <-- call every 5 seconds

    return () => clearInterval(interval);
  }, []);

//--------------> handleRegisterClick
  const handleRegisterClick = () => {
    const params = new URLSearchParams();
    
    if (ref.trim()) {
      params.set('ref', ref.trim());
    }
    
    if (productType === 'Subscription' || productType === 'Market Agent') {
      // For subscription service and Market Agent, use continent and default country
      const defaultCountry = continent === 'North America' ? 'USA' : 'Germany';
      const formattedLocation = `${continent}_${defaultCountry}`;
      params.set('location', formattedLocation);
    } else if (location) {
      const formattedLocation = `${continent}_${country}_${location}`;
      params.set('location', formattedLocation);
    }
    
    if (productType) {
      params.set('productType', productType);
    }
    
    if (slaTier) {
      params.set('slaTier', slaTier);
    }
    
    // Subscription is always included when "Subscription" is selected
    
    router.push(`/checkout?${params.toString()}`);
  };

  const handleClearReferral = async () => {
    try {
      const res = await fetch('/api/clear-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: 'cus_SZ2eFL9zIHFxop' }),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Referral metadata cleared successfully.');
      } else {
        alert(`Failed to clear: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Unexpected error occurred.');
    }
  };

//--------------> handlePurchaseClick
  const handlePurchaseClick = () => {
    const params = new URLSearchParams();
    
    // Always use refInput as the ref parameter
    if (ref.trim()) {
      params.set('ref', ref.trim());
    }
    
    // Use userIdRef as a separate parameter
    if (userIdRef.trim()) {
      params.set('userId', userIdRef.trim());
    }
    
    if (productType === 'Subscription' || productType === 'Market Agent') {
      // For subscription service and Market Agent, use continent and default country
      const defaultCountry = continent === 'North America' ? 'USA' : 'Germany';
      const formattedLocation = `${continent}_${defaultCountry}`;
      params.set('location', formattedLocation);
    } else if (location) {
      const formattedLocation = `${continent}_${country}_${location}`;
      params.set('location', formattedLocation);
    }
    
    if (productType) {
      params.set('productType', productType);
    }
    
    if (slaTier) {
      params.set('slaTier', slaTier);
    }
    
    // Subscription is always included when "Subscription" is selected
    
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold">HomePage</h1>

      <button
        onClick={() => {
          const customerId = 'cus_SZ2eFL9zIHFxop';
          window.open(`/api/invoice/${customerId}/pdf`, '_blank');
        }}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Download PDF invoice
      </button>

      {/* registration module */}
      <div className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <div>
          <label htmlFor="productTypeSelect" className="block text-gray-700 mb-2">
            Select product type *
          </label>
          <select
            id="productTypeSelect"
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value);
              setSlaTier('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select product type</option>
            <option value="Subscription">Subscription</option>
            <option value="SLA">SLA</option>
            <option value="Product presentation service">Product presentation service</option>
            <option value="Market Agent">Market Agent</option>
          </select>
        </div>

        {productType === 'SLA' && (
          <div>
            <label htmlFor="slaTierSelect" className="block text-gray-700 mb-2">
              Select SLA tier *
            </label>
            <select
              id="slaTierSelect"
              value={slaTier}
              onChange={(e) => setSlaTier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select tier</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
            <div className="mt-2 text-sm text-gray-600">
              {slaTier === 'Gold' && (location === 'Berlin' || location === 'Dresden') && (
                <span>Gold: Premium support with fastest response times - €30/month</span>
              )}
              {slaTier === 'Gold' && (location === 'Washington' || location === 'Dallas' || location === 'New York') && (
                <span>Gold: Premium support with fastest response times - $35/month</span>
              )}
              {slaTier === 'Silver' && (location === 'Berlin' || location === 'Dresden') && (
                <span>Silver: Standard support with good response times - €20/month</span>
              )}
              {slaTier === 'Silver' && (location === 'Washington' || location === 'Dallas' || location === 'New York') && (
                <span>Silver: Standard support with good response times - $25/month</span>
              )}
              {slaTier === 'Bronze' && (location === 'Berlin' || location === 'Dresden') && (
                <span>Bronze: Basic support with standard response times - €10/month</span>
              )}
              {slaTier === 'Bronze' && (location === 'Washington' || location === 'Dallas' || location === 'New York') && (
                <span>Bronze: Basic support with standard response times - $15/month</span>
              )}
            </div>
          </div>
        )}

        {productType && (
          <>
            <div>
              <label htmlFor="continentSelect" className="block text-gray-700 mb-2">
                Select continent *
              </label>
              <select
                id="continentSelect"
                value={continent}
                onChange={(e) => {
                  setContinent(e.target.value);
                  setCountry('');
                  setLocation('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
                disabled={!productType || productType === 'SLA' && !slaTier}
              >
                <option value="">Select continent</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
              </select>
            </div>

            {continent && productType !== 'Subscription' && productType !== 'Market Agent' && (
              <>
                <div>
                  <label htmlFor="countrySelect" className="block text-gray-700 mb-2">
                    Select country *
                  </label>
                  <select
                    id="countrySelect"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setLocation('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    required
                    disabled={!continent}
                  >
                    <option value="">Select country</option>
                    {continent === 'North America' && (
                      <option value="USA">USA</option>
                    )}
                    {continent === 'Europe' && (
                      <option value="Germany">Germany</option>
                    )}
                  </select>
                </div>

                {country && (
                  <div>
                    <label htmlFor="locationSelect" className="block text-gray-700 mb-2">
                      Select location *
                    </label>
                    <select
                      id="locationSelect"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      required
                      disabled={!country}
                    >
                      <option value="">Select location</option>
                      {country === 'USA' && (
                        <>
                          <option value="Washington">Washington</option>
                          <option value="Dallas">Dallas</option>
                          <option value="New York">New York</option>
                        </>
                      )}
                      {country === 'Germany' && (
                        <>
                          <option value="Berlin">Berlin</option>
                          <option value="Dresden">Dresden</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <label htmlFor="refInput" className="block text-gray-700 mb-2">
          Please enter referral code (optionally):
        </label>
        <input
          id="refInput"
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="For example: cus_SZ2e..."
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />

        <button
          onClick={handleRegisterClick}
          disabled={!continent || !productType || (productType !== 'Subscription' && productType !== 'Market Agent' && !location)}
          className={`w-full px-4 py-2 rounded transition ${
            continent && productType && (productType === 'Subscription' || productType === 'Market Agent' || (country && location))
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Registration
        </button>
      </div>

      {/* clear referral */}
      <div>
        <button
          onClick={handleClearReferral}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Clear Referral Metadata
        </button>
      </div>

      {/* purchase logic */}
      <div>
         <label htmlFor="userIdRef" className="block text-gray-700 mb-2">
          If you are already our client please enter your ID:
        </label>
        <input
          id="userIdRef"
          type="text"
          value={userIdRef}
          onChange={(e) => setUserIdRef(e.target.value)}
          placeholder="For example: cus_SZ2e..."
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />

        <button
          onClick={handlePurchaseClick}
          disabled={!continent || !productType || !userIdRef.trim() || (productType !== 'Subscription' && productType !== 'Market Agent' && !location)}
          className={`w-full px-4 py-2 rounded transition ${
            continent && productType && userIdRef.trim() && (productType === 'Subscription' || productType === 'Market Agent' || (country && location))
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Purchase
        </button>
      </div>
    </main>
  );
}