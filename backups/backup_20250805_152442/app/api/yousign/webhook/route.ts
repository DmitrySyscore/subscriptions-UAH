import { NextRequest, NextResponse } from 'next/server';

const YOUSIGN_API_KEY = process.env.YOUSIGN_API_KEY!;
const YOUSIGN_API_URL = 'https://api.yousign.app/v3';

// Cache for storing signing statuses: procedureId -> true
const signingStatusCache = new Map<string, boolean>();

export async function POST(req: NextRequest) {
  const payload = await req.json();
  console.log('Yousign webhook received:', payload);

  const event = payload.eventName;
  const procedure = payload.procedure;

  if (event !== 'procedure.finished' || !procedure?.id) {
    return NextResponse.json({ success: false, message: 'Invalid event or procedure' }, { status: 400 });
  }

  const procedureId = procedure.id;

  try {
    // === 0. Save to cache that the procedure is complete ===
    signingStatusCache.set(procedureId, true);
    console.log(`Procedure ${procedureId} marked as finished in cache`);

    // === 1. Get the details of the procedure ===
    const procedureRes = await fetch(`${YOUSIGN_API_URL}/procedures/${procedureId}`, {
      headers: {
        Authorization: `Bearer ${YOUSIGN_API_KEY}`,
      },
    });

    const procedureData = await procedureRes.json();
    const fileId = procedureData?.files?.[0]?.id;

    if (!fileId) {
      throw new Error('No file ID found in procedure');
    }

    // === 2. Download the signed document ===
    const fileRes = await fetch(`${YOUSIGN_API_URL}/files/${fileId}/download`, {
      headers: {
        Authorization: `Bearer ${YOUSIGN_API_KEY}`,
      },
    });

    if (!fileRes.ok) {
      throw new Error('Failed to download signed document');
    }

    const fileBuffer = Buffer.from(await fileRes.arrayBuffer());

    // === 3. Receive a ref for payment via Stripe ===
    const metadata = procedure.metadata || {};
    const ref = metadata.stripeCustomerId || procedure.name?.split(' ').pop(); // Fallback from the name

    if (!ref) {
      throw new Error('No ref (stripeCustomerId) found in metadata or name');
    }

    // === 4. Call create-checkout-session ===
    const checkoutRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref }),
    });

    const checkoutData = await checkoutRes.json();

    if (!checkoutRes.ok || !checkoutData?.url) {
      throw new Error('Failed to create Stripe checkout session');
    }

    const checkoutUrl = checkoutData.url;
    console.log('Stripe Checkout Session created after signing:', checkoutUrl);

    // === (optional) save file, send email, upload to S3, etc. ===
    console.log(`Signed file downloaded. Size: ${fileBuffer.length} bytes`);

    return NextResponse.json({
      success: true,
      message: 'Signed document downloaded and Stripe session created.',
      checkoutUrl,
    });
  } catch (err: any) {
    console.error('Webhook processing failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Export the cache so that it can be used in another API if necessary.
export { signingStatusCache };
