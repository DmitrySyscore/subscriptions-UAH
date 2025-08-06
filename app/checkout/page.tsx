'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SLAStatus {
  hasActiveSLA: boolean;
  tier?: string;
  location?: string;
  subscriptionId?: string;
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
        return;
      }

      setCheckingSLA(true);
      setSlaError(null);
      setTierError(null);

      try {
        const res = await fetch(`/api/check-sla-status?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (res.ok) {
          setSlaStatus({
            hasActiveSLA: data.hasActiveSLA,
            tier: data.slaTier,
            location: data.location,
            subscriptionId: data.subscriptionId
          });

          // Check for tier conflict if user is trying to purchase SLA
          const urlParams = new URLSearchParams(window.location.search);
          const selectedTier = urlParams.get('slaTier');
          const productType = urlParams.get('productType');
          
          if (data.hasActiveSLA && selectedTier && (productType === 'SLA' || productType === 'Both')) {
            const currentTierLevel = getTierLevel(data.slaTier);
            const selectedTierLevel = getTierLevel(selectedTier);
            
            // Get selected location from URL parameters
            const selectedLocation = urlParams.get('location');
            
            // Check if this is a same-locale downgrade
            const isSameLocale = selectedLocation === data.location;
            const isDowngrade = selectedTierLevel <= currentTierLevel;
            
            if (isDowngrade && isSameLocale) {
              setTierError(`You already have an active ${data.slaTier} subscription in ${data.location}. You cannot downgrade to ${selectedTier} in the same region.`);
            } else if (isDowngrade && !isSameLocale) {
              // Allow cross-locale downgrades, but show a warning
              console.log(`Allowing cross-locale downgrade: ${data.slaTier} ${data.location} → ${selectedTier} ${selectedLocation}`);
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
      // Check if this is an upgrade scenario
      const searchParams = new URLSearchParams(window.location.search);
      const selectedTier = searchParams.get('slaTier');
      const productType = searchParams.get('productType');
      const selectedLocation = searchParams.get('location');
      
      const isSLAPurchase = selectedTier && (productType === 'SLA' || productType === 'Both');
      
      // Check for upgrade scenarios
      let isUpgrade = false;
      if (isSLAPurchase && slaStatus?.hasActiveSLA) {
        const currentTierLevel = getTierLevel(slaStatus.tier || '');
        const selectedTierLevel = getTierLevel(selectedTier);
        
        // Tier upgrade (regardless of location)
        const isTierUpgrade = selectedTierLevel > currentTierLevel;
        
        // Same-tier cross-locale switch
        const isCrossLocaleSwitch = selectedTierLevel === currentTierLevel && selectedLocation !== slaStatus.location;
        
        isUpgrade = isTierUpgrade || isCrossLocaleSwitch;
      }
      
      // If this is an upgrade, cancel the current subscription first
      if (isUpgrade && slaStatus?.subscriptionId) {
        const confirmUpgrade = window.confirm(
          `You are ${selectedLocation === slaStatus.location ? 'upgrading' : 'switching'} from ${slaStatus.tier} (${slaStatus.location}) to ${selectedTier} (${selectedLocation}). Your current active ${slaStatus.tier} subscription will be cancelled. Do you want to continue?`
        );
        
        if (!confirmUpgrade) {
          setLoading(false);
          return;
        }

        const cancelRes = await fetch('/api/cancel-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: slaStatus.subscriptionId }),
        });

        if (!cancelRes.ok) {
          const errorData = await cancelRes.json();
          alert(`Failed to cancel current subscription: ${errorData.error}`);
          setLoading(false);
          return;
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
      const includeSubscription = searchParams.get('includeSubscription');

      const params = new URLSearchParams();
      params.set('signatureRequestId', data.signatureRequestId);
      params.set('signatureLink', data.signatureLink); // Don't double-encode
      if (ref) params.set('ref', ref);
      if (userId) params.set('userId', userId);
      if (location) params.set('location', location);
      if (productType) params.set('productType', productType);
      if (selectedTier) params.set('slaTier', selectedTier);
      if (includeSubscription) params.set('includeSubscription', includeSubscription);

      router.push(`/signature-status?${params.toString()}`);
    } catch (err) {
      console.error('Error when starting signature:', err);
      alert('An error has occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSLAStatusColor = () => {
    if (!slaStatus) return 'text-gray-600';
    return slaStatus.hasActiveSLA ? 'text-green-600' : 'text-red-600';
  };

  const getSLAStatusText = () => {
    if (checkingSLA) return 'Checking SLA status...';
    if (slaError) return `Error: ${slaError}`;
    if (!userId) return 'No user ID provided';
    
    if (slaStatus?.hasActiveSLA) {
      return `Active ${slaStatus.tier} SLA (${slaStatus.location})`;
    }
    return 'No active SLA found';
  };

  const getUpgradeInfo = () => {
    if (!slaStatus?.hasActiveSLA) return null;
    
    const searchParams = new URLSearchParams(window.location.search);
    const selectedTier = searchParams.get('slaTier');
    const productType = searchParams.get('productType');
    const selectedLocation = searchParams.get('location');
    
    if (!selectedTier || (productType !== 'SLA' && productType !== 'Both')) {
      return null;
    }
    
    const currentTierLevel = getTierLevel(slaStatus.tier || '');
    const selectedTierLevel = getTierLevel(selectedTier);
    
    // Check if this is a tier upgrade (regardless of location)
    if (selectedTierLevel > currentTierLevel) {
      return {
        isUpgrade: true,
        fromTier: slaStatus.tier,
        toTier: selectedTier,
        fromLocation: slaStatus.location,
        toLocation: selectedLocation,
        message: `Upgrade from ${slaStatus.tier} (${slaStatus.location}) to ${selectedTier} (${selectedLocation}) - current active subscription will be cancelled`
      };
    }
    
    // Check if this is a same-tier cross-locale upgrade
    if (selectedTierLevel === currentTierLevel && selectedLocation !== slaStatus.location) {
      return {
        isUpgrade: true,
        fromTier: slaStatus.tier,
        toTier: selectedTier,
        fromLocation: slaStatus.location,
        toLocation: selectedLocation,
        message: `Switch from ${slaStatus.tier} (${slaStatus.location}) to ${selectedTier} (${selectedLocation}) - current active subscription will be cancelled`
      };
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

      {/* SLA Status Display */}
      <div className={`mb-4 text-sm font-medium ${getSLAStatusColor()}`}>
        {getSLAStatusText()}
      </div>

      {/* Tier Error Display */}
      {tierError && (
        <div className="mb-4 text-sm font-medium text-red-600">
          {tierError}
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
        disabled={loading || (ref && !inviterName) || !signerFirstName || !signerLastName || !signerEmail || !!tierError}
      >
        {loading ? 'Loading...' : 'Proceed to signing documents'}
      </button>
    </div>
  );
}
