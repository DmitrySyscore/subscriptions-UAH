import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import FormData from 'form-data';
import { Blob } from 'buffer'; 
import { Readable } from 'stream'; 
 
 
 export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signerFirstName, signerLastName, signerEmail } = body;
    
    const apiKey = process.env.YOUSIGN_API_KEY!;
    const pdfPath = path.join(process.cwd(), 'app', 'Terms.pdf');
      
    // --- Step 1: Create Signature Request ---
    const signatureReqRes = await fetch('https://api-sandbox.yousign.app/v3/signature_requests', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ordered_signers : true,
        name: 'Terms Agreement',
        delivery_mode: 'email',
      }),
    });
 
    if (!signatureReqRes.ok) {
      const errText = await signatureReqRes.text();
      console.error('Signature request creation failed:', errText);
      return new Response(JSON.stringify({ error: 'Signature request creation failed', details: errText }), { status: 500 });
    }
 
    const signatureReqJson = await signatureReqRes.json();
    const signatureRequestId = signatureReqJson['id'];

    //adding PDF file to signature request
    const fileContent = readFileSync(pdfPath);
    const fileBlob = new Blob([fileContent]);
    const fileStream = Readable.fromWeb(fileBlob.stream() as any);
    const form = new FormData();

    form.append('file', fileStream, {
      filename: 'Terms.pdf',
      contentType: 'application/pdf',
    });
    form.append('name', 'Terms.pdf');
    form.append('nature', 'signable_document');
 
    const docMetaRes = await fetch(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: form,
    });
 
    const document = await docMetaRes.json();
    const documentId = document['id'];
  
    if (!docMetaRes.ok) {
      const errText = await docMetaRes.text();
      console.error('Document metadata creation failed:', errText);
      return new Response(JSON.stringify({ error: 'Metadata creation failed', details: errText }), { status: 500 });
    }
 
    // Adding signer
      const signerResponse = await fetch(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/signers`, {
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
          locale: 'en'
        },
        signature_level: 'qualified_electronic_signature',
      }),
    });
 
    if (!signerResponse.ok) {
      const errorJson = await signerResponse.json();
      console.error('Failed to create signer:', errorJson);
      return Response.json({ error: errorJson }, { status: signerResponse.status });
    }
 
    const signer = await signerResponse.json();
    const signerId = signer['id'];
 
    // Adding signature field
    const fieldResponse = await fetch(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents/${documentId}/fields`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        type: 'signature',
        signer_id: signerId,
        "page": 1,
        "width": 99,
        "height": 39,
        "x": 400,
        "y": 545
      }),
    });
 
    // Start signature request
    const startResponse = await fetch(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/activate`, {
      method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
    });
 
  const started = await startResponse.json() as {
    signers?: {
      signature_link?: string;
    }[];
  };

  const signatureLink = started.signers?.[0]?.signature_link;
 
  return new Response(
    JSON.stringify({
       signatureLink,
       signatureRequestId,
      }),
    {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  );
 
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
