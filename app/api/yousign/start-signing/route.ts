import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import FormData from 'form-data';
import { Blob } from 'buffer'; 
import { Readable } from 'stream'; 
 
 
interface YouSignSignatureRequest {
  id: string;
}

interface YouSignDocument {
  id: string;
}

interface YouSignSigner {
  id: string;
}

interface YouSignStartedResponse {
  signers?: Array<{
    signature_link?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signerFirstName, signerLastName, signerEmail, productType, location, slaTier } = body;
   
   // Validate required fields
   if (!signerFirstName || !signerLastName || !signerEmail) {
     return new Response(
       JSON.stringify({ error: 'Missing required fields: signerFirstName, signerLastName, signerEmail' }),
       { status: 400 }
     );
   }

   const apiKey = process.env.YOUSIGN_API_KEY;
   if (!apiKey) {
     return new Response(
       JSON.stringify({ error: 'YouSign API key not configured' }),
       { status: 500 }
     );
   }

   // Select appropriate PDF(s) based on productType
   let pdfFilenames: string[] = [];
   
   if (productType === 'Market Agent') {
     // For Market Agent, send both General Terms and SLA Machine documents
     pdfFilenames = ['UAH_DE_General_Terms_[20250828].pdf', 'UAH_DE_SLA_Machine.pdf'];
   } else if (productType === 'SLA') {
     pdfFilenames = ['UAH_DE_SLA_Machine.pdf'];
   } else if (productType === 'Product presentation service') {
     pdfFilenames = ['UAH_DE_SLA_Component.pdf'];
   } else {
     pdfFilenames = ['UAH_DE_General_Terms_[20250828].pdf'];
   }

   console.log('Starting signature process:', {
     productType,
     signerFirstName,
     signerLastName,
     signerEmail,
     pdfFilenames
   });

   // --- Step 1: Create Signature Request ---
   const signatureReqRes = await fetch('https://api-sandbox.yousign.app/v3/signature_requests', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${apiKey}`,
       'Content-Type': 'application/json',
       Accept: 'application/json',
     },
     body: JSON.stringify({
       ordered_signers: true,
       name: `Terms Agreement - ${productType || 'General'}${productType === 'Market Agent' ? ' (2 documents)' : ''}`,
       delivery_mode: 'email',
     }),
   });

   if (!signatureReqRes.ok) {
     const errText = await signatureReqRes.text();
     console.error('Signature request creation failed:', errText);
     return new Response(
       JSON.stringify({ error: 'Signature request creation failed', details: errText }),
       { status: signatureReqRes.status }
     );
   }

   const signatureReqJson = await signatureReqRes.json() as YouSignSignatureRequest;
   const signatureRequestId = signatureReqJson.id;

   // --- Step 2: Upload PDF document(s) ---
   const documentIds: string[] = [];
   
   for (const pdfFilename of pdfFilenames) {
     const pdfPath = path.join(process.cwd(), 'app', pdfFilename);
     const fileContent = readFileSync(pdfPath);
     const form = new FormData();
     
     form.append('file', fileContent, {
       filename: pdfFilename,
       contentType: 'application/pdf',
     });
     form.append('name', pdfFilename);
     form.append('nature', 'signable_document');

     const docMetaRes = await fetch(
       `https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents`,
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${apiKey}`,
           Accept: 'application/json',
         },
         body: form,
       }
     );

     if (!docMetaRes.ok) {
       const errText = await docMetaRes.text();
       console.error('Document upload failed:', errText);
       return new Response(
         JSON.stringify({ error: 'Document upload failed', details: errText }),
         { status: docMetaRes.status }
       );
     }

     const document = await docMetaRes.json() as YouSignDocument;
     documentIds.push(document.id);
   }

   // --- Step 3: Add signer ---
   const signerResponse = await fetch(
     `https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/signers`,
     {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${apiKey}`,
         'Content-Type': 'application/json',
         Accept: 'application/json',
       },
       body: JSON.stringify({
         info: {
           first_name: signerFirstName,
           last_name: signerLastName,
           email: signerEmail,
           locale: 'en',
         },
         signature_level: 'qualified_electronic_signature',
       }),
     }
   );

   if (!signerResponse.ok) {
     const errorJson = await signerResponse.json();
     console.error('Failed to create signer:', errorJson);
     return Response.json({ error: errorJson }, { status: signerResponse.status });
   }

   const signer = await signerResponse.json() as YouSignSigner;
   const signerId = signer.id;

   // --- Step 4: Add signature field(s) ---
   // Dynamic signature field placement based on document type and filename
   const signatureConfigs: Record<string, { page: number; x: number; y: number; width: number; height: number }> = {
     'UAH_DE_General_Terms_[20250828].pdf': { page: 14, x: 64, y: 711, width: 180, height: 75 },
     'UAH_DE_SLA_Machine.pdf': { page: 3, x: 145, y: 664, width: 99, height: 39 },
     'UAH_DE_SLA_Component.pdf': { page: 2, x: 145, y: 701, width: 99, height: 39 },
   };

   // Create signature fields for each document
   for (let i = 0; i < documentIds.length; i++) {
     const documentId = documentIds[i];
     const pdfFilename = pdfFilenames[i];
     const signatureConfig = signatureConfigs[pdfFilename] || signatureConfigs['UAH_DE_General_Terms_[20250828].pdf'];

     const fieldResponse = await fetch(
       `https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents/${documentId}/fields`,
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${apiKey}`,
           'Content-Type': 'application/json',
           Accept: 'application/json',
         },
         body: JSON.stringify({
           type: 'signature',
           signer_id: signerId,
           page: signatureConfig.page,
           width: signatureConfig.width,
           height: signatureConfig.height,
           x: signatureConfig.x,
           y: signatureConfig.y,
         }),
       }
     );

     if (!fieldResponse.ok) {
       const errorJson = await fieldResponse.json();
       console.error('Failed to create signature field:', errorJson);
       return Response.json({ error: errorJson }, { status: fieldResponse.status });
     }
   }

   // --- Step 5: Activate signature request ---
   const startResponse = await fetch(
     `https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/activate`,
     {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${apiKey}`,
         Accept: 'application/json',
       },
     }
   );

   if (!startResponse.ok) {
     const errorJson = await startResponse.json();
     console.error('Failed to activate signature request:', errorJson);
     return Response.json({ error: errorJson }, { status: startResponse.status });
   }

   const started = await startResponse.json() as YouSignStartedResponse;
   const signatureLink = started.signers?.[0]?.signature_link;

   if (!signatureLink) {
     console.error('No signature link found in response:', started);
     return new Response(
       JSON.stringify({ error: 'No signature link generated' }),
       { status: 500 }
     );
   }

   console.log('Signature process completed successfully:', {
     signatureRequestId,
     signatureLink,
     productType,
     location,
     slaTier
   });

   return new Response(
     JSON.stringify({
       signatureLink,
       signatureRequestId,
       productType,
       location,
       slaTier
     }),
     {
       status: 200,
       headers: {
         'Content-Type': 'application/json',
       },
     }
   );
 } catch (error: any) {
   console.error('Error in start-signing:', error);
   return new Response(
     JSON.stringify({
       error: 'Internal server error',
       details: error.message || 'Unknown error occurred'
     }),
     { status: 500 }
   );
 }
}
