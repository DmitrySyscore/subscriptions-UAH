'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SLAStatus {
  hasActiveSLA: boolean;
  tier?: string;
  location?: string;
  subscriptionId?: string;
  activeSLAs?: Array<{
    subscriptionId: string;
    productId: string;
    productName: string;
    slaTier: string;
    location: string;
  }>;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [signerFirstName, setSignerFirstName] = useState('');
  const [signerLastName, setSignerLastName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);
  const [checkingSLA, setCheckingSLA] = useState(false);
  const [slaError, setSlaError] = useState<string | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationConflict, setLocationConflict] = useState<string | null>(null);

  const ref = searchParams.get('ref'); // referrer Id
  const userId = searchParams.get('userId'); // userId from URL
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

  useEffect(() => {
    const checkSLAStatus = async () => {
      if (!userId) {
        setSlaStatus(null);
        setSlaError(null);
        setTierError(null);
        setLocationConflict(null);
        return;
      }

      setCheckingSLA(true);
      setSlaError(null);
      setTierError(null);
      setLocationConflict(null);

      try {
        const res = await fetch(`/api/check-sla-status?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (res.ok) {
          setSlaStatus({
            hasActiveSLA: data.hasActiveSLA,
            tier: data.slaTier,
            location: data.location,
            subscriptionId: data.subscriptionId,
            activeSLAs: data.activeSLAs || []
          });

          // Check for location-based conflicts
          const urlParams = new URLSearchParams(window.location.search);
          const selectedTier = urlParams.get('slaTier');
          const productType = urlParams.get('productType');
          const selectedLocation = urlParams.get('location');
          
          if (selectedTier && selectedLocation && productType === 'SLA') {
            const selectedContinent = selectedLocation.split('_')[0];
            
            // Check for continent-level restriction
            const existingContinents = new Set(
              data.activeSLAs?.map((sla: any) => sla.location.split('_')[0]) || []
            );
            
            if (existingContinents.has(selectedContinent)) {
              // Allow same continent purchases
            } else if (data.activeSLAs && data.activeSLAs.length > 0) {
              // Prevent cross-continent purchases
              const existingContinent = data.activeSLAs[0].location.split('_')[0];
              setLocationConflict(`You already have an active SLA subscription in ${existingContinent}. You cannot purchase an SLA in a different continent (${selectedContinent}).`);
            }

            // Check for existing SLA at same location with same tier
            const existingSLA = data.activeSLAs?.find(
              (sla: any) => sla.location === selectedLocation &&
                           sla.slaTier.toLowerCase() === selectedTier.toLowerCase()
            );

            if (existingSLA) {
              setLocationConflict(`You already have a ${selectedTier} SLA subscription at this location. You can only upgrade to a higher tier.`);
            }

            // Check for tier upgrades
            const existingAtLocation = data.activeSLAs?.find(
              (sla: any) => sla.location === selectedLocation
            );

            if (existingAtLocation) {
              const currentTierLevel = getTierLevel(existingAtLocation.slaTier);
              const selectedTierLevel = getTierLevel(selectedTier);
              
              if (selectedTierLevel <= currentTierLevel) {
                setLocationConflict(`You already have a ${existingAtLocation.slaTier} SLA at this location. You can only upgrade to a higher tier.`);
              }
            }
          }
        } else {
          setSlaError(data.error || 'Failed to check SLA status');
          setSlaStatus(null);
        }
      } catch (error) {
        console.error('Error checking SLA status:', error);
        setSlaError('Failed to check SLA status');
        setSlaStatus(null);
      } finally {
        setCheckingSLA(false);
      }
    };

    checkSLAStatus();
  }, [userId]);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const selectedTier = searchParams.get('slaTier');
      const productType = searchParams.get('productType');
      const selectedLocation = searchParams.get('location');
      
      const isSLAPurchase = selectedTier && productType === 'SLA';
      
      if (isSLAPurchase && selectedLocation && slaStatus?.activeSLAs) {
        const selectedContinent = selectedLocation.split('_')[0];
        
        // Check for continent-level restriction
        const existingContinents = new Set(
          slaStatus.activeSLAs.map(sla => sla.location.split('_')[0])
        );
        
        if (!existingContinents.has(selectedContinent) && slaStatus.activeSLAs.length > 0) {
          const existingContinent = slaStatus.activeSLAs[0].location.split('_')[0];
          alert(`You already have an active SLA subscription in ${existingContinent}. You cannot purchase an SLA in a different continent (${selectedContinent}).`);
          setLoading(false);
          return;
        }

        // Find existing SLA at the same location
        const existingSLA = slaStatus.activeSLAs.find(
          sla => sla.location === selectedLocation
        );

        if (existingSLA) {
          const currentTierLevel = getTierLevel(existingSLA.slaTier);
          const selectedTierLevel = getTierLevel(selectedTier);
          
          if (selectedTierLevel > currentTierLevel) {
            // This is an upgrade
            const confirmUpgrade = window.confirm(
              `You are upgrading from ${existingSLA.slaTier} to ${selectedTier} at ${selectedLocation}. Your current ${existingSLA.slaTier} subscription will be cancelled. Do you want to continue?`
            );
            
            if (!confirmUpgrade) {
              setLoading(false);
              return;
            }

            const cancelRes = await fetch('/api/cancel-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionId: existingSLA.subscriptionId }),
            });

            if (!cancelRes.ok) {
              const errorData = await cancelRes.json();
              alert(`Failed to cancel current subscription: ${errorData.error}`);
              setLoading(false);
              return;
            }
          }
        }
      }

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
      const location = searchParams.get('location');

      const params = new URLSearchParams();
      params.set('signatureRequestId', data.signatureRequestId);
      params.set('signatureLink', data.signatureLink); // Don't double-encode
      if (ref) params.set('ref', ref);
      if (userId) params.set('userId', userId);
      if (location) params.set('location', location);
      if (productType) params.set('productType', productType);
      if (selectedTier) params.set('slaTier', selectedTier);

      router.push(`/signature-status?${params.toString()}`);
    } catch (err) {
      console.error('Error when starting signature:', err);
      alert('An error has occurred');
    } finally {
      setLoading(false);
    }
  };

  const getUpgradeInfo = () => {
    if (!slaStatus?.activeSLAs || slaStatus.activeSLAs.length === 0) return null;
    
    const searchParams = new URLSearchParams(window.location.search);
    const selectedTier = searchParams.get('slaTier');
    const productType = searchParams.get('productType');
    const selectedLocation = searchParams.get('location');
    
    if (!selectedTier || !selectedLocation || productType !== 'SLA') {
      return null;
    }
    
    // Find existing SLA at the same location
    const existingSLA = slaStatus.activeSLAs.find(
      sla => sla.location === selectedLocation
    );
    
    if (existingSLA) {
      const currentTierLevel = getTierLevel(existingSLA.slaTier);
      const selectedTierLevel = getTierLevel(selectedTier);
      
      if (selectedTierLevel > currentTierLevel) {
        return {
          isUpgrade: true,
          fromTier: existingSLA.slaTier,
          toTier: selectedTier,
          message: `Upgrade from ${existingSLA.slaTier} to ${selectedTier} at ${selectedLocation} - current active subscription will be cancelled and updated`
        };
      }
    }
    
    return null;
  };

  const getTierLevel = (tier: string): number => {
    const tierMap: Record<string, number> = {
      'Bronze': 1,
      'Silver': 2,
      'Gold': 3,
    };
    return tierMap[tier] || 0;
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
          type="email"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
      />

      {/* Subscription Information */}
      {(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const selectedTier = searchParams.get('slaTier');
        const productType = searchParams.get('productType');
        const location = searchParams.get('location');
        
        let selectedText = '';
        if (selectedTier && location && productType === 'SLA') {
          const locationParts = location.split('_');
          const continent = locationParts[0] || 'Unknown';
          const country = locationParts[1] || 'Unknown';
          const city = locationParts[2] || 'Unknown';
          selectedText = `${selectedTier} SLA - ${continent}, ${country}, ${city}`;
        }

        return (
          <>
            {/* Display all active subscriptions */}
            {slaStatus?.activeSLAs && slaStatus.activeSLAs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-blue-600">Active Subscriptions:</h3>
                <div className="space-y-1">
                  {slaStatus.activeSLAs.map((sla, index) => {
                    const locationParts = sla.location.split('_');
                    const continent = locationParts[0] || 'Unknown';
                    const country = locationParts[1] || 'Unknown';
                    const city = locationParts[2] || 'Unknown';
                    
                    return (
                      <div key={index} className="text-sm text-blue-600">
                        {sla.slaTier} SLA - {continent}, {country}, {city}
                      </div>
                    ); 
                  })}
                </div>
              </div>
            )}
            
            {selectedText && (
              <div className="mb-4 text-sm font-medium text-green-600">
              <br/>
                <strong>Selected:</strong> {selectedText}
              </div>
            )}
          </>
        );
      })()}

      {/* Tier Error Display */}
      {tierError && (
        <div className="mb-4 text-sm font-medium text-red-600">
          {tierError}
        </div>
      )}

      {/* Location Conflict Display */}
      {locationConflict && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
        <br/>

          <strong>❌ Location Restriction:</strong> {locationConflict}
        </div>
      )}

      {/* Upgrade Warning Display */}
      {(() => {
        const upgradeInfo = getUpgradeInfo();
        return upgradeInfo && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>⚠️ Upgrade Notice:</strong> {upgradeInfo.message}
          </div>
        );
      })()}

      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={handleCheckout}
        disabled={loading || (ref && !inviterName) || !signerFirstName || !signerLastName || !signerEmail || !!tierError || !!locationConflict}
      >
        {loading ? 'Loading...' : 'Proceed to signing documents'}
      </button>
    </div>
  );
}
