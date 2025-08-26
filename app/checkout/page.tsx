'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AllSubscriptionsStatus {
  hasActiveSubscriptions: boolean;
  customerId?: string;
  activeSLAs?: Array<{
    subscriptionId: string;
    productId: string;
    productName: string;
    slaTier: string;
    location: string;
  }>;
  activeSubscriptions?: Array<{
    subscriptionId: string;
    productId: string;
    productName: string;
    location: string;
    serviceType: string;
  }>;
  activeProductPresentations?: Array<{
    subscriptionId: string;
    productId: string;
    productName: string;
    location: string;
    serviceType: string;
  }>;
  activeMarketAgents?: Array<{
    subscriptionId: string;
    productId: string;
    productName: string;
    location: string;
    serviceType: string;
  }>;
  totalActiveSubscriptions?: number;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [signerFirstName, setSignerFirstName] = useState('');
  const [signerLastName, setSignerLastName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [subscriptionsStatus, setSubscriptionsStatus] = useState<AllSubscriptionsStatus | null>(null);
  const [checkingSubscriptions, setCheckingSubscriptions] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);
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
    const checkAllSubscriptions = async () => {
      if (!userId) {
        setSubscriptionsStatus(null);
        setSubscriptionsError(null);
        setTierError(null);
        setLocationConflict(null);
        return;
      }

      setCheckingSubscriptions(true);
      setSubscriptionsError(null);
      setTierError(null);
      setLocationConflict(null);

      try {
        const res = await fetch(`/api/check-all-subscriptions?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();     

        if (res.ok) {
          setSubscriptionsStatus(data);

          // Check for location-based conflicts
          const selectedTier = searchParams.get('slaTier');
          const productType = searchParams.get('productType');
          const selectedLocation = searchParams.get('location');
          
          if (selectedLocation) {
            const selectedContinent = selectedLocation.split('_')[0];
            
            // Check for continent-level restriction across all service types
            const allActiveServices = [
              ...(data.activeSLAs || []),
              ...(data.activeSubscriptions || []),
              ...(data.activeProductPresentations || [])
            ];
            
            const existingContinents = new Set(
              allActiveServices.map((service: any) => service.location.split('_')[0])
            );
            
            // Prevent cross-continent purchases for any service type
            if (existingContinents.size > 0 && !existingContinents.has(selectedContinent)) {
              const existingContinent = Array.from(existingContinents)[0];
              setLocationConflict(`You have active services in ${existingContinent} already. You cannot purchase services in a different continent (${selectedContinent}).`);
              return;
            }

            // SLA-specific checks
            if (selectedTier && productType === 'SLA') {
              // Check for existing SLA at same location with same tier
              const existingSLA = data.activeSLAs?.find(
                (sla: any) => sla.location === selectedLocation &&
                             sla.slaTier.toLowerCase() === selectedTier.toLowerCase()
              );

              if (existingSLA) {
                setLocationConflict(`You have a ${selectedTier} SLA subscription at this location already. You can only upgrade to a higher tier.`);
                return;
              }

              // Check for tier upgrades
              const existingAtLocation = data.activeSLAs?.find(
                (sla: any) => sla.location === selectedLocation
              );

              if (existingAtLocation) {
                const currentTierLevel = getTierLevel(existingAtLocation.slaTier);
                const selectedTierLevel = getTierLevel(selectedTier);
                
                if (selectedTierLevel <= currentTierLevel) {
                  setLocationConflict(`You have a ${existingAtLocation.slaTier} SLA at this location already. You can only upgrade to a higher tier.`);
                  return;
                }
              }
            }

            // Check for duplicate subscriptions at same location
            if (productType === 'Subscription') {
              const existingSubscription = data.activeSubscriptions?.find(
                (sub: any) => {
                  return sub.location === selectedLocation ||
                         (selectedLocation && selectedLocation.startsWith(sub.location));
                }
              );
              if (existingSubscription) {
                setLocationConflict(`You have a ${existingSubscription.productName} in ${selectedLocation.split('_')[0]} already.`);
                return;
              }            
            }

            // Check for duplicate product presentations at same location
            if (productType === 'Product presentation service') {
              const existingPresentation = data.activeProductPresentations?.find(
                (pres: any) => pres.location === selectedLocation
              );
              
              if (existingPresentation) {
                setLocationConflict(`You have a ${existingPresentation.productName} in ${selectedLocation} already.`);
                return;
              }
            }

            // Check for duplicate Market Agents at same location
            if (productType === 'Market Agent') {
              const existingMarketAgent = data.activeMarketAgents?.find(
                (agent: any) => agent.location === selectedLocation
              );

              if (existingMarketAgent) {
                setLocationConflict(`You have a ${existingMarketAgent.productName} in ${selectedLocation.split('_')[0]} already.`);
                return;
              }
            }
          }
        } else {
          setSubscriptionsError(data.error || 'Failed to check subscriptions status');
          setSubscriptionsStatus(null);
        }
      } catch (error) {
        console.error('Error checking subscriptions status:', error);
        setSubscriptionsError('Failed to check subscriptions status');
        setSubscriptionsStatus(null);
      } finally {
        setCheckingSubscriptions(false);
      }
    };

    checkAllSubscriptions();
  }, [userId, searchParams]);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const selectedTier = searchParams.get('slaTier');
      const productType = searchParams.get('productType');
      const selectedLocation = searchParams.get('location');
      
      const isSLAPurchase = selectedTier && productType === 'SLA';
      
      if (isSLAPurchase && selectedLocation && subscriptionsStatus?.activeSLAs) {
        const selectedContinent = selectedLocation.split('_')[0];
        
        // Check for continent-level restriction
        const existingContinents = new Set(
          subscriptionsStatus.activeSLAs.map(sla => sla.location.split('_')[0])
        );
        
        if (!existingContinents.has(selectedContinent) && subscriptionsStatus.activeSLAs.length > 0) {
          const existingContinent = subscriptionsStatus.activeSLAs[0].location.split('_')[0];
          alert(`You have an active SLA subscription in ${existingContinent} already. You cannot purchase an SLA in a different continent (${selectedContinent}).`);
          setLoading(false);
          return;
        }

        // Find existing SLA at the same location
        const existingSLA = subscriptionsStatus.activeSLAs.find(
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
          } else if (selectedTierLevel <= currentTierLevel) {
            alert(`You have a ${existingSLA.slaTier} SLA at this location already. You can only upgrade to a higher tier.`);
            setLoading(false);
            return;
          }
        }
      }

      // Comprehensive duplicate entry check for Location restrictions
      if (selectedLocation) {
        const allActiveServices = [
          ...(subscriptionsStatus?.activeSLAs || []),
          ...(subscriptionsStatus?.activeSubscriptions || []),
          ...(subscriptionsStatus?.activeProductPresentations || []),
          ...(subscriptionsStatus?.activeMarketAgents || [])
        ];

        // Check for any existing service at the same location
        const existingService = allActiveServices.find(
          service => service.location === selectedLocation
        );

        if (existingService) {
          let serviceType = '';
          if (subscriptionsStatus?.activeSLAs?.some(sla => sla.location === selectedLocation)) {
            serviceType = 'SLA';
          } else if (subscriptionsStatus?.activeSubscriptions?.some(sub => sub.location === selectedLocation)) {
            serviceType = 'Subscription service';
          } else if (subscriptionsStatus?.activeProductPresentations?.some(pres => pres.location === selectedLocation)) {
            serviceType = 'Product presentation service';
          } else if (subscriptionsStatus?.activeMarketAgents?.some(agent => agent.location === selectedLocation)) {
            serviceType = 'Market Agent service';
          }

          alert(`You have a ${serviceType} at this location already. You cannot purchase additional services at the same location.`);
          setLoading(false);
          return;
        }

        // Additional specific checks for each service type
        if (productType === 'Subscription') {
          // Already handled by the general check above, but keeping for explicit messaging
          const existingSubscription = subscriptionsStatus?.activeSubscriptions?.find(
            sub => sub.location === selectedLocation
          );
          
          if (existingSubscription) {
            alert(`You have a subscription service at this location already.`);
            setLoading(false);
            return;
          }
        }

        if (productType === 'Product presentation service') {
          const existingPresentation = subscriptionsStatus?.activeProductPresentations?.find(
            pres => pres.location === selectedLocation
          );
          
          if (existingPresentation) {
            alert(`You have a product presentation service at this location already.`);
            setLoading(false);
            return;
          }
        }

        if (productType === 'Market Agent') {
          const existingMarketAgent = subscriptionsStatus?.activeMarketAgents?.find(
            agent => agent.location === selectedLocation
          );

          if (existingMarketAgent) {
            alert(`You have a Market Agent service at this location already.`);
            setLoading(false);
            return;
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
      
      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem('referrer', ref || '');
      }
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
    if (!subscriptionsStatus?.activeSLAs || subscriptionsStatus.activeSLAs.length === 0) return null;
    
    const selectedTier = searchParams.get('slaTier');
    const productType = searchParams.get('productType');
    const selectedLocation = searchParams.get('location');
    
    if (!selectedTier || !selectedLocation || productType !== 'SLA') {
      return null;
    }
    
    // Find existing SLA at the same location
    const existingSLA = subscriptionsStatus.activeSLAs.find(
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
        const selectedTier = searchParams.get('slaTier');
        const productType = searchParams.get('productType');
        const location = searchParams.get('location');
        
        let selectedText = '';
        if (location) {
          const locationParts = location.split('_');
          const continent = locationParts[0] || 'Unknown';
          const country = locationParts[1] || 'Unknown';
          const city = locationParts[2] || 'Unknown';
          
          if (productType === 'SLA' && selectedTier) {
            selectedText = `${selectedTier} SLA Service - ${continent}, ${country}, ${city}`;
          } else if (productType === 'Subscription') {
            selectedText = `Subscription Service - ${continent}`;
          } else if (productType === 'Product presentation service') {
            selectedText = `Product Presentation Service - ${continent}, ${country}, ${city}`;
          } else if (productType === 'Market Agent') {
            selectedText = `Market Agent - ${continent}`;
          }
        }

        return (
          <>
            {/* Display all active SLA's */}
            {subscriptionsStatus?.activeSLAs && subscriptionsStatus.activeSLAs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-blue-600">Active SLA Subscriptions:</h3>
                <div className="space-y-1">
                  {subscriptionsStatus.activeSLAs.map((sla, index) => {
                    const locationParts = sla.location.split('_');
                    const continent = locationParts[0] || 'Unknown';
                    const country = locationParts[1] || 'Unknown';
                    const city = locationParts[2] || 'Unknown';
                    
                    return (
                      <div key={index} className="text-sm text-blue-600">
                        -- {sla.slaTier} SLA - {continent}, {country}, {city}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Display active Subscription services */}
            {subscriptionsStatus?.activeSubscriptions && subscriptionsStatus.activeSubscriptions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-green-600">Active Subscription Services:</h3>
                <div className="space-y-1">
                  {subscriptionsStatus.activeSubscriptions.map((subscription, index) => {
                    const locationParts = subscription.location.split('_');
                    const continent = locationParts[0] || 'Unknown';
                    
                    return (
                      <div key={index} className="text-sm text-green-600">
                        -- {subscription.productName} - {continent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Display active Product Presentation services */}
            {subscriptionsStatus?.activeProductPresentations && subscriptionsStatus.activeProductPresentations.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-purple-600">Active Product Presentation Services:</h3>
                <div className="space-y-1">
                  {subscriptionsStatus.activeProductPresentations.map((service, index) => {
                    const locationParts = service.location.split('_');
                    const continent = locationParts[0] || 'Unknown';
                    const country = locationParts[1] || 'Unknown';
                    const city = locationParts[2] || 'Unknown';
                    
                    return (
                      <div key={index} className="text-sm text-purple-600">
                        -- {service.productName} - {continent}, {country}, {city}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Display active Market Agent services */}
            {subscriptionsStatus?.activeMarketAgents && subscriptionsStatus.activeMarketAgents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-orange-600">Active Market Agent Services:</h3>
                <div className="space-y-1">
                  {subscriptionsStatus.activeMarketAgents.map((agent, index) => {
                    const locationParts = agent.location.split('_');
                    const continent = locationParts[0] || 'Unknown';
                    
                    return (
                      <div key={index} className="text-sm text-orange-600">
                        -- {agent.productName} - {continent}
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
