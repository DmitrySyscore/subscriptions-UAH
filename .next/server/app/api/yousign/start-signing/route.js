/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/yousign/start-signing/route";
exports.ids = ["app/api/yousign/start-signing/route"];
exports.modules = {

/***/ "(rsc)/./app/api/yousign/start-signing/route.ts":
/*!************************************************!*\
  !*** ./app/api/yousign/start-signing/route.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var node_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! node-fetch */ \"(rsc)/./node_modules/node-fetch/src/index.js\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var form_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! form-data */ \"(rsc)/./node_modules/form-data/lib/form_data.js\");\n/* harmony import */ var form_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(form_data__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { signerFirstName, signerLastName, signerEmail, productType, location, slaTier } = body;\n        // Validate required fields\n        if (!signerFirstName || !signerLastName || !signerEmail) {\n            return new Response(JSON.stringify({\n                error: 'Missing required fields: signerFirstName, signerLastName, signerEmail'\n            }), {\n                status: 400\n            });\n        }\n        const apiKey = process.env.YOUSIGN_API_KEY;\n        if (!apiKey) {\n            return new Response(JSON.stringify({\n                error: 'YouSign API key not configured'\n            }), {\n                status: 500\n            });\n        }\n        // Select appropriate PDF(s) based on productType\n        let pdfFilenames = [];\n        if (productType === 'Market Agent') {\n            // For Market Agent, send both General Terms and SLA Machine documents\n            pdfFilenames = [\n                'UAH_DE_General_Terms_[20250828].pdf',\n                'UAH_DE_SLA_Machine.pdf'\n            ];\n        } else if (productType === 'SLA') {\n            pdfFilenames = [\n                'UAH_DE_SLA_Machine.pdf'\n            ];\n        } else if (productType === 'Product presentation service') {\n            pdfFilenames = [\n                'UAH_DE_SLA_Component.pdf'\n            ];\n        } else {\n            pdfFilenames = [\n                'UAH_DE_General_Terms_[20250828].pdf'\n            ];\n        }\n        console.log('Starting signature process:', {\n            productType,\n            signerFirstName,\n            signerLastName,\n            signerEmail,\n            pdfFilenames\n        });\n        // --- Step 1: Create Signature Request ---\n        const signatureReqRes = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_3__[\"default\"])('https://api-sandbox.yousign.app/v3/signature_requests', {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                'Content-Type': 'application/json',\n                Accept: 'application/json'\n            },\n            body: JSON.stringify({\n                ordered_signers: true,\n                name: `Terms Agreement - ${productType || 'General'}${productType === 'Market Agent' ? ' (2 documents)' : ''}`,\n                delivery_mode: 'email'\n            })\n        });\n        if (!signatureReqRes.ok) {\n            const errText = await signatureReqRes.text();\n            console.error('Signature request creation failed:', errText);\n            return new Response(JSON.stringify({\n                error: 'Signature request creation failed',\n                details: errText\n            }), {\n                status: signatureReqRes.status\n            });\n        }\n        const signatureReqJson = await signatureReqRes.json();\n        const signatureRequestId = signatureReqJson.id;\n        // --- Step 2: Upload PDF document(s) ---\n        const documentIds = [];\n        for (const pdfFilename of pdfFilenames){\n            const pdfPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(process.cwd(), 'app', pdfFilename);\n            const fileContent = (0,fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(pdfPath);\n            const form = new (form_data__WEBPACK_IMPORTED_MODULE_2___default())();\n            form.append('file', fileContent, {\n                filename: pdfFilename,\n                contentType: 'application/pdf'\n            });\n            form.append('name', pdfFilename);\n            form.append('nature', 'signable_document');\n            const docMetaRes = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents`, {\n                method: 'POST',\n                headers: {\n                    Authorization: `Bearer ${apiKey}`,\n                    Accept: 'application/json'\n                },\n                body: form\n            });\n            if (!docMetaRes.ok) {\n                const errText = await docMetaRes.text();\n                console.error('Document upload failed:', errText);\n                return new Response(JSON.stringify({\n                    error: 'Document upload failed',\n                    details: errText\n                }), {\n                    status: docMetaRes.status\n                });\n            }\n            const document = await docMetaRes.json();\n            documentIds.push(document.id);\n        }\n        // --- Step 3: Add signer ---\n        const signerResponse = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/signers`, {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                'Content-Type': 'application/json',\n                Accept: 'application/json'\n            },\n            body: JSON.stringify({\n                info: {\n                    first_name: signerFirstName,\n                    last_name: signerLastName,\n                    email: signerEmail,\n                    locale: 'en'\n                },\n                signature_level: 'qualified_electronic_signature'\n            })\n        });\n        if (!signerResponse.ok) {\n            const errorJson = await signerResponse.json();\n            console.error('Failed to create signer:', errorJson);\n            return Response.json({\n                error: errorJson\n            }, {\n                status: signerResponse.status\n            });\n        }\n        const signer = await signerResponse.json();\n        const signerId = signer.id;\n        // --- Step 4: Add signature field(s) ---\n        // Dynamic signature field placement based on document type and filename\n        const signatureConfigs = {\n            'UAH_DE_General_Terms_[20250828].pdf': {\n                page: 14,\n                x: 64,\n                y: 711,\n                width: 180,\n                height: 75\n            },\n            'UAH_DE_SLA_Machine.pdf': {\n                page: 3,\n                x: 145,\n                y: 664,\n                width: 99,\n                height: 39\n            },\n            'UAH_DE_SLA_Component.pdf': {\n                page: 2,\n                x: 145,\n                y: 701,\n                width: 99,\n                height: 39\n            }\n        };\n        // Create signature fields for each document\n        for(let i = 0; i < documentIds.length; i++){\n            const documentId = documentIds[i];\n            const pdfFilename = pdfFilenames[i];\n            const signatureConfig = signatureConfigs[pdfFilename] || signatureConfigs['UAH_DE_General_Terms_[20250828].pdf'];\n            const fieldResponse = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents/${documentId}/fields`, {\n                method: 'POST',\n                headers: {\n                    Authorization: `Bearer ${apiKey}`,\n                    'Content-Type': 'application/json',\n                    Accept: 'application/json'\n                },\n                body: JSON.stringify({\n                    type: 'signature',\n                    signer_id: signerId,\n                    page: signatureConfig.page,\n                    width: signatureConfig.width,\n                    height: signatureConfig.height,\n                    x: signatureConfig.x,\n                    y: signatureConfig.y\n                })\n            });\n            if (!fieldResponse.ok) {\n                const errorJson = await fieldResponse.json();\n                console.error('Failed to create signature field:', errorJson);\n                return Response.json({\n                    error: errorJson\n                }, {\n                    status: fieldResponse.status\n                });\n            }\n        }\n        // --- Step 5: Activate signature request ---\n        const startResponse = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/activate`, {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                Accept: 'application/json'\n            }\n        });\n        if (!startResponse.ok) {\n            const errorJson = await startResponse.json();\n            console.error('Failed to activate signature request:', errorJson);\n            return Response.json({\n                error: errorJson\n            }, {\n                status: startResponse.status\n            });\n        }\n        const started = await startResponse.json();\n        const signatureLink = started.signers?.[0]?.signature_link;\n        if (!signatureLink) {\n            console.error('No signature link found in response:', started);\n            return new Response(JSON.stringify({\n                error: 'No signature link generated'\n            }), {\n                status: 500\n            });\n        }\n        console.log('Signature process completed successfully:', {\n            signatureRequestId,\n            signatureLink,\n            productType,\n            location,\n            slaTier\n        });\n        return new Response(JSON.stringify({\n            signatureLink,\n            signatureRequestId,\n            productType,\n            location,\n            slaTier\n        }), {\n            status: 200,\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        });\n    } catch (error) {\n        console.error('Error in start-signing:', error);\n        return new Response(JSON.stringify({\n            error: 'Internal server error',\n            details: error.message || 'Unknown error occurred'\n        }), {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3lvdXNpZ24vc3RhcnQtc2lnbmluZy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFrQztBQUNIO0FBQ1A7QUFDUztBQXVCMUIsZUFBZUksS0FBS0MsT0FBZ0I7SUFDekMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsUUFBUUUsSUFBSTtRQUMvQixNQUFNLEVBQUVDLGVBQWUsRUFBRUMsY0FBYyxFQUFFQyxXQUFXLEVBQUVDLFdBQVcsRUFBRUMsUUFBUSxFQUFFQyxPQUFPLEVBQUUsR0FBR1A7UUFFMUYsMkJBQTJCO1FBQzNCLElBQUksQ0FBQ0UsbUJBQW1CLENBQUNDLGtCQUFrQixDQUFDQyxhQUFhO1lBQ3ZELE9BQU8sSUFBSUksU0FDVEMsS0FBS0MsU0FBUyxDQUFDO2dCQUFFQyxPQUFPO1lBQXdFLElBQ2hHO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxNQUFNQyxTQUFTQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7UUFDMUMsSUFBSSxDQUFDSCxRQUFRO1lBQ1gsT0FBTyxJQUFJTCxTQUNUQyxLQUFLQyxTQUFTLENBQUM7Z0JBQUVDLE9BQU87WUFBaUMsSUFDekQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLGlEQUFpRDtRQUNqRCxJQUFJSyxlQUF5QixFQUFFO1FBRS9CLElBQUlaLGdCQUFnQixnQkFBZ0I7WUFDbEMsc0VBQXNFO1lBQ3RFWSxlQUFlO2dCQUFDO2dCQUF1QzthQUF5QjtRQUNsRixPQUFPLElBQUlaLGdCQUFnQixPQUFPO1lBQ2hDWSxlQUFlO2dCQUFDO2FBQXlCO1FBQzNDLE9BQU8sSUFBSVosZ0JBQWdCLGdDQUFnQztZQUN6RFksZUFBZTtnQkFBQzthQUEyQjtRQUM3QyxPQUFPO1lBQ0xBLGVBQWU7Z0JBQUM7YUFBc0M7UUFDeEQ7UUFFQUMsUUFBUUMsR0FBRyxDQUFDLCtCQUErQjtZQUN6Q2Q7WUFDQUg7WUFDQUM7WUFDQUM7WUFDQWE7UUFDRjtRQUVBLDJDQUEyQztRQUMzQyxN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QVFDLEdBQUcsQ0FBQyw2Q0FBNkM7WUFDdkRjO1lBQ0F3QztZQUNBcEU7WUFDQUM7WUFDQUM7UUFDRjtRQUVBLE9BQU8sSUFBSUMsU0FDVEMsS0FBS0MsU0FBUyxDQUFDO1lBQ2IrRDtZQUNBeEM7WUFDQTVCO1lBQ0FDO1lBQ0FDO1FBQ0YsSUFDQTtZQUNFSyxRQUFRO1lBQ1JVLFNBQVM7Z0JBQ1AsZ0JBQWdCO1lBQ2xCO1FBQ0Y7SUFFSixFQUFFLE9BQU9YLE9BQVk7UUFDbkJPLFFBQVFQLEtBQUssQ0FBQywyQkFBMkJBO1FBQ3pDLE9BQU8sSUFBSUgsU0FDVEMsS0FBS0MsU0FBUyxDQUFDO1lBQ2JDLE9BQU87WUFDUG9CLFNBQVNwQixNQUFNaUUsT0FBTyxJQUFJO1FBQzVCLElBQ0E7WUFBRWhFLFFBQVE7UUFBSTtJQUVsQjtBQUNEIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXERtaXRyeUtpcG9yZW5rb1xcRGVza3RvcFxcbmV3XFxzdWJzY3JpcHRpb25zLVVBSFxcYXBwXFxhcGlcXHlvdXNpZ25cXHN0YXJ0LXNpZ25pbmdcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IEZvcm1EYXRhIGZyb20gJ2Zvcm0tZGF0YSc7XHJcbmltcG9ydCB7IEJsb2IgfSBmcm9tICdidWZmZXInOyBcclxuaW1wb3J0IHsgUmVhZGFibGUgfSBmcm9tICdzdHJlYW0nOyBcclxuIFxyXG4gXHJcbmludGVyZmFjZSBZb3VTaWduU2lnbmF0dXJlUmVxdWVzdCB7XHJcbiAgaWQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFlvdVNpZ25Eb2N1bWVudCB7XHJcbiAgaWQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFlvdVNpZ25TaWduZXIge1xyXG4gIGlkOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBZb3VTaWduU3RhcnRlZFJlc3BvbnNlIHtcclxuICBzaWduZXJzPzogQXJyYXk8e1xyXG4gICAgc2lnbmF0dXJlX2xpbms/OiBzdHJpbmc7XHJcbiAgfT47XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xyXG4gICAgY29uc3QgeyBzaWduZXJGaXJzdE5hbWUsIHNpZ25lckxhc3ROYW1lLCBzaWduZXJFbWFpbCwgcHJvZHVjdFR5cGUsIGxvY2F0aW9uLCBzbGFUaWVyIH0gPSBib2R5O1xyXG4gICBcclxuICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXHJcbiAgIGlmICghc2lnbmVyRmlyc3ROYW1lIHx8ICFzaWduZXJMYXN0TmFtZSB8fCAhc2lnbmVyRW1haWwpIHtcclxuICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICAgSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzOiBzaWduZXJGaXJzdE5hbWUsIHNpZ25lckxhc3ROYW1lLCBzaWduZXJFbWFpbCcgfSksXHJcbiAgICAgICB7IHN0YXR1czogNDAwIH1cclxuICAgICApO1xyXG4gICB9XHJcblxyXG4gICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5ZT1VTSUdOX0FQSV9LRVk7XHJcbiAgIGlmICghYXBpS2V5KSB7XHJcbiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcclxuICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdZb3VTaWduIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQnIH0pLFxyXG4gICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICAgKTtcclxuICAgfVxyXG5cclxuICAgLy8gU2VsZWN0IGFwcHJvcHJpYXRlIFBERihzKSBiYXNlZCBvbiBwcm9kdWN0VHlwZVxyXG4gICBsZXQgcGRmRmlsZW5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICBcclxuICAgaWYgKHByb2R1Y3RUeXBlID09PSAnTWFya2V0IEFnZW50Jykge1xyXG4gICAgIC8vIEZvciBNYXJrZXQgQWdlbnQsIHNlbmQgYm90aCBHZW5lcmFsIFRlcm1zIGFuZCBTTEEgTWFjaGluZSBkb2N1bWVudHNcclxuICAgICBwZGZGaWxlbmFtZXMgPSBbJ1VBSF9ERV9HZW5lcmFsX1Rlcm1zX1syMDI1MDgyOF0ucGRmJywgJ1VBSF9ERV9TTEFfTWFjaGluZS5wZGYnXTtcclxuICAgfSBlbHNlIGlmIChwcm9kdWN0VHlwZSA9PT0gJ1NMQScpIHtcclxuICAgICBwZGZGaWxlbmFtZXMgPSBbJ1VBSF9ERV9TTEFfTWFjaGluZS5wZGYnXTtcclxuICAgfSBlbHNlIGlmIChwcm9kdWN0VHlwZSA9PT0gJ1Byb2R1Y3QgcHJlc2VudGF0aW9uIHNlcnZpY2UnKSB7XHJcbiAgICAgcGRmRmlsZW5hbWVzID0gWydVQUhfREVfU0xBX0NvbXBvbmVudC5wZGYnXTtcclxuICAgfSBlbHNlIHtcclxuICAgICBwZGZGaWxlbmFtZXMgPSBbJ1VBSF9ERV9HZW5lcmFsX1Rlcm1zX1syMDI1MDgyOF0ucGRmJ107XHJcbiAgIH1cclxuXHJcbiAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBzaWduYXR1cmUgcHJvY2VzczonLCB7XHJcbiAgICAgcHJvZHVjdFR5cGUsXHJcbiAgICAgc2lnbmVyRmlyc3ROYW1lLFxyXG4gICAgIHNpZ25lckxhc3ROYW1lLFxyXG4gICAgIHNpZ25lckVtYWlsLFxyXG4gICAgIHBkZkZpbGVuYW1lc1xyXG4gICB9KTtcclxuXHJcbiAgIC8vIC0tLSBTdGVwIDE6IENyZWF0ZSBTaWduYXR1cmUgUmVxdWVzdCAtLS1cclxuICAgY29uc3Qgc2lnbmF0dXJlUmVxUmVzID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLXNhbmRib3gueW91c2lnbi5hcHAvdjMvc2lnbmF0dXJlX3JlcXVlc3RzJywge1xyXG4gICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgIGhlYWRlcnM6IHtcclxuICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcclxuICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICB9LFxyXG4gICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgIG9yZGVyZWRfc2lnbmVyczogdHJ1ZSxcclxuICAgICAgIG5hbWU6IGBUZXJtcyBBZ3JlZW1lbnQgLSAke3Byb2R1Y3RUeXBlIHx8ICdHZW5lcmFsJ30ke3Byb2R1Y3RUeXBlID09PSAnTWFya2V0IEFnZW50JyA/ICcgKDIgZG9jdW1lbnRzKScgOiAnJ31gLFxyXG4gICAgICAgZGVsaXZlcnlfbW9kZTogJ2VtYWlsJyxcclxuICAgICB9KSxcclxuICAgfSk7XHJcblxyXG4gICBpZiAoIXNpZ25hdHVyZVJlcVJlcy5vaykge1xyXG4gICAgIGNvbnN0IGVyclRleHQgPSBhd2FpdCBzaWduYXR1cmVSZXFSZXMudGV4dCgpO1xyXG4gICAgIGNvbnNvbGUuZXJyb3IoJ1NpZ25hdHVyZSByZXF1ZXN0IGNyZWF0aW9uIGZhaWxlZDonLCBlcnJUZXh0KTtcclxuICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICAgSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1NpZ25hdHVyZSByZXF1ZXN0IGNyZWF0aW9uIGZhaWxlZCcsIGRldGFpbHM6IGVyclRleHQgfSksXHJcbiAgICAgICB7IHN0YXR1czogc2lnbmF0dXJlUmVxUmVzLnN0YXR1cyB9XHJcbiAgICAgKTtcclxuICAgfVxyXG5cclxuICAgY29uc3Qgc2lnbmF0dXJlUmVxSnNvbiA9IGF3YWl0IHNpZ25hdHVyZVJlcVJlcy5qc29uKCkgYXMgWW91U2lnblNpZ25hdHVyZVJlcXVlc3Q7XHJcbiAgIGNvbnN0IHNpZ25hdHVyZVJlcXVlc3RJZCA9IHNpZ25hdHVyZVJlcUpzb24uaWQ7XHJcblxyXG4gICAvLyAtLS0gU3RlcCAyOiBVcGxvYWQgUERGIGRvY3VtZW50KHMpIC0tLVxyXG4gICBjb25zdCBkb2N1bWVudElkczogc3RyaW5nW10gPSBbXTtcclxuICAgXHJcbiAgIGZvciAoY29uc3QgcGRmRmlsZW5hbWUgb2YgcGRmRmlsZW5hbWVzKSB7XHJcbiAgICAgY29uc3QgcGRmUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnYXBwJywgcGRmRmlsZW5hbWUpO1xyXG4gICAgIGNvbnN0IGZpbGVDb250ZW50ID0gcmVhZEZpbGVTeW5jKHBkZlBhdGgpO1xyXG4gICAgIGNvbnN0IGZvcm0gPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICBcclxuICAgICBmb3JtLmFwcGVuZCgnZmlsZScsIGZpbGVDb250ZW50LCB7XHJcbiAgICAgICBmaWxlbmFtZTogcGRmRmlsZW5hbWUsXHJcbiAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3BkZicsXHJcbiAgICAgfSk7XHJcbiAgICAgZm9ybS5hcHBlbmQoJ25hbWUnLCBwZGZGaWxlbmFtZSk7XHJcbiAgICAgZm9ybS5hcHBlbmQoJ25hdHVyZScsICdzaWduYWJsZV9kb2N1bWVudCcpO1xyXG5cclxuICAgICBjb25zdCBkb2NNZXRhUmVzID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgICBgaHR0cHM6Ly9hcGktc2FuZGJveC55b3VzaWduLmFwcC92My9zaWduYXR1cmVfcmVxdWVzdHMvJHtzaWduYXR1cmVSZXF1ZXN0SWR9L2RvY3VtZW50c2AsXHJcbiAgICAgICB7XHJcbiAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxyXG4gICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICB9LFxyXG4gICAgICAgICBib2R5OiBmb3JtLFxyXG4gICAgICAgfVxyXG4gICAgICk7XHJcblxyXG4gICAgIGlmICghZG9jTWV0YVJlcy5vaykge1xyXG4gICAgICAgY29uc3QgZXJyVGV4dCA9IGF3YWl0IGRvY01ldGFSZXMudGV4dCgpO1xyXG4gICAgICAgY29uc29sZS5lcnJvcignRG9jdW1lbnQgdXBsb2FkIGZhaWxlZDonLCBlcnJUZXh0KTtcclxuICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdEb2N1bWVudCB1cGxvYWQgZmFpbGVkJywgZGV0YWlsczogZXJyVGV4dCB9KSxcclxuICAgICAgICAgeyBzdGF0dXM6IGRvY01ldGFSZXMuc3RhdHVzIH1cclxuICAgICAgICk7XHJcbiAgICAgfVxyXG5cclxuICAgICBjb25zdCBkb2N1bWVudCA9IGF3YWl0IGRvY01ldGFSZXMuanNvbigpIGFzIFlvdVNpZ25Eb2N1bWVudDtcclxuICAgICBkb2N1bWVudElkcy5wdXNoKGRvY3VtZW50LmlkKTtcclxuICAgfVxyXG5cclxuICAgLy8gLS0tIFN0ZXAgMzogQWRkIHNpZ25lciAtLS1cclxuICAgY29uc3Qgc2lnbmVyUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICBgaHR0cHM6Ly9hcGktc2FuZGJveC55b3VzaWduLmFwcC92My9zaWduYXR1cmVfcmVxdWVzdHMvJHtzaWduYXR1cmVSZXF1ZXN0SWR9L3NpZ25lcnNgLFxyXG4gICAgIHtcclxuICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXHJcbiAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgfSxcclxuICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgaW5mbzoge1xyXG4gICAgICAgICAgIGZpcnN0X25hbWU6IHNpZ25lckZpcnN0TmFtZSxcclxuICAgICAgICAgICBsYXN0X25hbWU6IHNpZ25lckxhc3ROYW1lLFxyXG4gICAgICAgICAgIGVtYWlsOiBzaWduZXJFbWFpbCxcclxuICAgICAgICAgICBsb2NhbGU6ICdlbicsXHJcbiAgICAgICAgIH0sXHJcbiAgICAgICAgIHNpZ25hdHVyZV9sZXZlbDogJ3F1YWxpZmllZF9lbGVjdHJvbmljX3NpZ25hdHVyZScsXHJcbiAgICAgICB9KSxcclxuICAgICB9XHJcbiAgICk7XHJcblxyXG4gICBpZiAoIXNpZ25lclJlc3BvbnNlLm9rKSB7XHJcbiAgICAgY29uc3QgZXJyb3JKc29uID0gYXdhaXQgc2lnbmVyUmVzcG9uc2UuanNvbigpO1xyXG4gICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgc2lnbmVyOicsIGVycm9ySnNvbik7XHJcbiAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBlcnJvcjogZXJyb3JKc29uIH0sIHsgc3RhdHVzOiBzaWduZXJSZXNwb25zZS5zdGF0dXMgfSk7XHJcbiAgIH1cclxuXHJcbiAgIGNvbnN0IHNpZ25lciA9IGF3YWl0IHNpZ25lclJlc3BvbnNlLmpzb24oKSBhcyBZb3VTaWduU2lnbmVyO1xyXG4gICBjb25zdCBzaWduZXJJZCA9IHNpZ25lci5pZDtcclxuXHJcbiAgIC8vIC0tLSBTdGVwIDQ6IEFkZCBzaWduYXR1cmUgZmllbGQocykgLS0tXHJcbiAgIC8vIER5bmFtaWMgc2lnbmF0dXJlIGZpZWxkIHBsYWNlbWVudCBiYXNlZCBvbiBkb2N1bWVudCB0eXBlIGFuZCBmaWxlbmFtZVxyXG4gICBjb25zdCBzaWduYXR1cmVDb25maWdzOiBSZWNvcmQ8c3RyaW5nLCB7IHBhZ2U6IG51bWJlcjsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0+ID0ge1xyXG4gICAgICdVQUhfREVfR2VuZXJhbF9UZXJtc19bMjAyNTA4MjhdLnBkZic6IHsgcGFnZTogMTQsIHg6IDY0LCB5OiA3MTEsIHdpZHRoOiAxODAsIGhlaWdodDogNzUgfSxcclxuICAgICAnVUFIX0RFX1NMQV9NYWNoaW5lLnBkZic6IHsgcGFnZTogMywgeDogMTQ1LCB5OiA2NjQsIHdpZHRoOiA5OSwgaGVpZ2h0OiAzOSB9LFxyXG4gICAgICdVQUhfREVfU0xBX0NvbXBvbmVudC5wZGYnOiB7IHBhZ2U6IDIsIHg6IDE0NSwgeTogNzAxLCB3aWR0aDogOTksIGhlaWdodDogMzkgfSxcclxuICAgfTtcclxuXHJcbiAgIC8vIENyZWF0ZSBzaWduYXR1cmUgZmllbGRzIGZvciBlYWNoIGRvY3VtZW50XHJcbiAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9jdW1lbnRJZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICBjb25zdCBkb2N1bWVudElkID0gZG9jdW1lbnRJZHNbaV07XHJcbiAgICAgY29uc3QgcGRmRmlsZW5hbWUgPSBwZGZGaWxlbmFtZXNbaV07XHJcbiAgICAgY29uc3Qgc2lnbmF0dXJlQ29uZmlnID0gc2lnbmF0dXJlQ29uZmlnc1twZGZGaWxlbmFtZV0gfHwgc2lnbmF0dXJlQ29uZmlnc1snVUFIX0RFX0dlbmVyYWxfVGVybXNfWzIwMjUwODI4XS5wZGYnXTtcclxuXHJcbiAgICAgY29uc3QgZmllbGRSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgYGh0dHBzOi8vYXBpLXNhbmRib3gueW91c2lnbi5hcHAvdjMvc2lnbmF0dXJlX3JlcXVlc3RzLyR7c2lnbmF0dXJlUmVxdWVzdElkfS9kb2N1bWVudHMvJHtkb2N1bWVudElkfS9maWVsZHNgLFxyXG4gICAgICAge1xyXG4gICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcclxuICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICB9LFxyXG4gICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgdHlwZTogJ3NpZ25hdHVyZScsXHJcbiAgICAgICAgICAgc2lnbmVyX2lkOiBzaWduZXJJZCxcclxuICAgICAgICAgICBwYWdlOiBzaWduYXR1cmVDb25maWcucGFnZSxcclxuICAgICAgICAgICB3aWR0aDogc2lnbmF0dXJlQ29uZmlnLndpZHRoLFxyXG4gICAgICAgICAgIGhlaWdodDogc2lnbmF0dXJlQ29uZmlnLmhlaWdodCxcclxuICAgICAgICAgICB4OiBzaWduYXR1cmVDb25maWcueCxcclxuICAgICAgICAgICB5OiBzaWduYXR1cmVDb25maWcueSxcclxuICAgICAgICAgfSksXHJcbiAgICAgICB9XHJcbiAgICAgKTtcclxuXHJcbiAgICAgaWYgKCFmaWVsZFJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICBjb25zdCBlcnJvckpzb24gPSBhd2FpdCBmaWVsZFJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgc2lnbmF0dXJlIGZpZWxkOicsIGVycm9ySnNvbik7XHJcbiAgICAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7IGVycm9yOiBlcnJvckpzb24gfSwgeyBzdGF0dXM6IGZpZWxkUmVzcG9uc2Uuc3RhdHVzIH0pO1xyXG4gICAgIH1cclxuICAgfVxyXG5cclxuICAgLy8gLS0tIFN0ZXAgNTogQWN0aXZhdGUgc2lnbmF0dXJlIHJlcXVlc3QgLS0tXHJcbiAgIGNvbnN0IHN0YXJ0UmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICBgaHR0cHM6Ly9hcGktc2FuZGJveC55b3VzaWduLmFwcC92My9zaWduYXR1cmVfcmVxdWVzdHMvJHtzaWduYXR1cmVSZXF1ZXN0SWR9L2FjdGl2YXRlYCxcclxuICAgICB7XHJcbiAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxyXG4gICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgIH0sXHJcbiAgICAgfVxyXG4gICApO1xyXG5cclxuICAgaWYgKCFzdGFydFJlc3BvbnNlLm9rKSB7XHJcbiAgICAgY29uc3QgZXJyb3JKc29uID0gYXdhaXQgc3RhcnRSZXNwb25zZS5qc29uKCk7XHJcbiAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGFjdGl2YXRlIHNpZ25hdHVyZSByZXF1ZXN0OicsIGVycm9ySnNvbik7XHJcbiAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBlcnJvcjogZXJyb3JKc29uIH0sIHsgc3RhdHVzOiBzdGFydFJlc3BvbnNlLnN0YXR1cyB9KTtcclxuICAgfVxyXG5cclxuICAgY29uc3Qgc3RhcnRlZCA9IGF3YWl0IHN0YXJ0UmVzcG9uc2UuanNvbigpIGFzIFlvdVNpZ25TdGFydGVkUmVzcG9uc2U7XHJcbiAgIGNvbnN0IHNpZ25hdHVyZUxpbmsgPSBzdGFydGVkLnNpZ25lcnM/LlswXT8uc2lnbmF0dXJlX2xpbms7XHJcblxyXG4gICBpZiAoIXNpZ25hdHVyZUxpbmspIHtcclxuICAgICBjb25zb2xlLmVycm9yKCdObyBzaWduYXR1cmUgbGluayBmb3VuZCBpbiByZXNwb25zZTonLCBzdGFydGVkKTtcclxuICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICAgSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ05vIHNpZ25hdHVyZSBsaW5rIGdlbmVyYXRlZCcgfSksXHJcbiAgICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICApO1xyXG4gICB9XHJcblxyXG4gICBjb25zb2xlLmxvZygnU2lnbmF0dXJlIHByb2Nlc3MgY29tcGxldGVkIHN1Y2Nlc3NmdWxseTonLCB7XHJcbiAgICAgc2lnbmF0dXJlUmVxdWVzdElkLFxyXG4gICAgIHNpZ25hdHVyZUxpbmssXHJcbiAgICAgcHJvZHVjdFR5cGUsXHJcbiAgICAgbG9jYXRpb24sXHJcbiAgICAgc2xhVGllclxyXG4gICB9KTtcclxuXHJcbiAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgc2lnbmF0dXJlTGluayxcclxuICAgICAgIHNpZ25hdHVyZVJlcXVlc3RJZCxcclxuICAgICAgIHByb2R1Y3RUeXBlLFxyXG4gICAgICAgbG9jYXRpb24sXHJcbiAgICAgICBzbGFUaWVyXHJcbiAgICAgfSksXHJcbiAgICAge1xyXG4gICAgICAgc3RhdHVzOiAyMDAsXHJcbiAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICB9LFxyXG4gICAgIH1cclxuICAgKTtcclxuIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gc3RhcnQtc2lnbmluZzonLCBlcnJvcik7XHJcbiAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLFxyXG4gICAgICAgZGV0YWlsczogZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvciBvY2N1cnJlZCdcclxuICAgICB9KSxcclxuICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgKTtcclxuIH1cclxufVxyXG4iXSwibmFtZXMiOlsicmVhZEZpbGVTeW5jIiwiZmV0Y2giLCJwYXRoIiwiRm9ybURhdGEiLCJQT1NUIiwicmVxdWVzdCIsImJvZHkiLCJqc29uIiwic2lnbmVyRmlyc3ROYW1lIiwic2lnbmVyTGFzdE5hbWUiLCJzaWduZXJFbWFpbCIsInByb2R1Y3RUeXBlIiwibG9jYXRpb24iLCJzbGFUaWVyIiwiUmVzcG9uc2UiLCJKU09OIiwic3RyaW5naWZ5IiwiZXJyb3IiLCJzdGF0dXMiLCJhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiWU9VU0lHTl9BUElfS0VZIiwicGRmRmlsZW5hbWVzIiwiY29uc29sZSIsImxvZyIsInNpZ25hdHVyZVJlcVJlcyIsIm1ldGhvZCIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiQWNjZXB0Iiwib3JkZXJlZF9zaWduZXJzIiwibmFtZSIsImRlbGl2ZXJ5X21vZGUiLCJvayIsImVyclRleHQiLCJ0ZXh0IiwiZGV0YWlscyIsInNpZ25hdHVyZVJlcUpzb24iLCJzaWduYXR1cmVSZXF1ZXN0SWQiLCJpZCIsImRvY3VtZW50SWRzIiwicGRmRmlsZW5hbWUiLCJwZGZQYXRoIiwiam9pbiIsImN3ZCIsImZpbGVDb250ZW50IiwiZm9ybSIsImFwcGVuZCIsImZpbGVuYW1lIiwiY29udGVudFR5cGUiLCJkb2NNZXRhUmVzIiwiZG9jdW1lbnQiLCJwdXNoIiwic2lnbmVyUmVzcG9uc2UiLCJpbmZvIiwiZmlyc3RfbmFtZSIsImxhc3RfbmFtZSIsImVtYWlsIiwibG9jYWxlIiwic2lnbmF0dXJlX2xldmVsIiwiZXJyb3JKc29uIiwic2lnbmVyIiwic2lnbmVySWQiLCJzaWduYXR1cmVDb25maWdzIiwicGFnZSIsIngiLCJ5Iiwid2lkdGgiLCJoZWlnaHQiLCJpIiwibGVuZ3RoIiwiZG9jdW1lbnRJZCIsInNpZ25hdHVyZUNvbmZpZyIsImZpZWxkUmVzcG9uc2UiLCJ0eXBlIiwic2lnbmVyX2lkIiwic3RhcnRSZXNwb25zZSIsInN0YXJ0ZWQiLCJzaWduYXR1cmVMaW5rIiwic2lnbmVycyIsInNpZ25hdHVyZV9saW5rIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/yousign/start-signing/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fyousign%2Fstart-signing%2Froute&page=%2Fapi%2Fyousign%2Fstart-signing%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fyousign%2Fstart-signing%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fyousign%2Fstart-signing%2Froute&page=%2Fapi%2Fyousign%2Fstart-signing%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fyousign%2Fstart-signing%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_yousign_start_signing_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/yousign/start-signing/route.ts */ \"(rsc)/./app/api/yousign/start-signing/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/yousign/start-signing/route\",\n        pathname: \"/api/yousign/start-signing\",\n        filename: \"route\",\n        bundlePath: \"app/api/yousign/start-signing/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\DmitryKiporenko\\\\Desktop\\\\new\\\\subscriptions-UAH\\\\app\\\\api\\\\yousign\\\\start-signing\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_yousign_start_signing_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ5b3VzaWduJTJGc3RhcnQtc2lnbmluZyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGeW91c2lnbiUyRnN0YXJ0LXNpZ25pbmclMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZ5b3VzaWduJTJGc3RhcnQtc2lnbmluZyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEbWl0cnlLaXBvcmVua28lNUNEZXNrdG9wJTVDbmV3JTVDc3Vic2NyaXB0aW9ucy1VQUglNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0RtaXRyeUtpcG9yZW5rbyU1Q0Rlc2t0b3AlNUNuZXclNUNzdWJzY3JpcHRpb25zLVVBSCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDdUQ7QUFDcEk7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxzdWJzY3JpcHRpb25zLVVBSFxcXFxhcHBcXFxcYXBpXFxcXHlvdXNpZ25cXFxcc3RhcnQtc2lnbmluZ1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkveW91c2lnbi9zdGFydC1zaWduaW5nL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkveW91c2lnbi9zdGFydC1zaWduaW5nXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS95b3VzaWduL3N0YXJ0LXNpZ25pbmcvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxEbWl0cnlLaXBvcmVua29cXFxcRGVza3RvcFxcXFxuZXdcXFxcc3Vic2NyaXB0aW9ucy1VQUhcXFxcYXBwXFxcXGFwaVxcXFx5b3VzaWduXFxcXHN0YXJ0LXNpZ25pbmdcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fyousign%2Fstart-signing%2Froute&page=%2Fapi%2Fyousign%2Fstart-signing%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fyousign%2Fstart-signing%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:https");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/web");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/get-intrinsic","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/es-object-atoms","vendor-chunks/node-fetch","vendor-chunks/asynckit","vendor-chunks/fetch-blob","vendor-chunks/mime-db","vendor-chunks/form-data","vendor-chunks/formdata-polyfill","vendor-chunks/web-streams-polyfill","vendor-chunks/node-domexception","vendor-chunks/mime-types","vendor-chunks/has-tostringtag","vendor-chunks/es-set-tostringtag","vendor-chunks/delayed-stream","vendor-chunks/combined-stream"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fyousign%2Fstart-signing%2Froute&page=%2Fapi%2Fyousign%2Fstart-signing%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fyousign%2Fstart-signing%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();