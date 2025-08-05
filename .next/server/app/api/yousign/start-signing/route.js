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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var node_fetch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! node-fetch */ \"(rsc)/./node_modules/node-fetch/src/index.js\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var form_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! form-data */ \"(rsc)/./node_modules/form-data/lib/form_data.js\");\n/* harmony import */ var form_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(form_data__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! buffer */ \"buffer\");\n/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(buffer__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! stream */ \"stream\");\n/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { signerFirstName, signerLastName, signerEmail } = body;\n        const apiKey = process.env.YOUSIGN_API_KEY;\n        const pdfPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(process.cwd(), 'app', 'Terms.pdf');\n        // --- Step 1: Create Signature Request ---\n        const signatureReqRes = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_5__[\"default\"])('https://api-sandbox.yousign.app/v3/signature_requests', {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                'Content-Type': 'application/json',\n                Accept: 'application/json'\n            },\n            body: JSON.stringify({\n                ordered_signers: true,\n                name: 'Terms Agreement',\n                delivery_mode: 'email'\n            })\n        });\n        if (!signatureReqRes.ok) {\n            const errText = await signatureReqRes.text();\n            console.error('Signature request creation failed:', errText);\n            return new Response(JSON.stringify({\n                error: 'Signature request creation failed',\n                details: errText\n            }), {\n                status: 500\n            });\n        }\n        const signatureReqJson = await signatureReqRes.json();\n        const signatureRequestId = signatureReqJson['id'];\n        //adding PDF file to signature request\n        const fileContent = (0,fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(pdfPath);\n        const fileBlob = new buffer__WEBPACK_IMPORTED_MODULE_3__.Blob([\n            fileContent\n        ]);\n        const fileStream = stream__WEBPACK_IMPORTED_MODULE_4__.Readable.fromWeb(fileBlob.stream());\n        const form = new (form_data__WEBPACK_IMPORTED_MODULE_2___default())();\n        form.append('file', fileStream, {\n            filename: 'Terms.pdf',\n            contentType: 'application/pdf'\n        });\n        form.append('name', 'Terms.pdf');\n        form.append('nature', 'signable_document');\n        const docMetaRes = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents`, {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                Accept: 'application/json'\n            },\n            body: form\n        });\n        const document = await docMetaRes.json();\n        const documentId = document['id'];\n        if (!docMetaRes.ok) {\n            const errText = await docMetaRes.text();\n            console.error('Document metadata creation failed:', errText);\n            return new Response(JSON.stringify({\n                error: 'Metadata creation failed',\n                details: errText\n            }), {\n                status: 500\n            });\n        }\n        // Adding signer\n        const signerResponse = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/signers`, {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                'Content-Type': 'application/json',\n                Accept: 'application/json'\n            },\n            body: JSON.stringify({\n                info: {\n                    first_name: signerFirstName,\n                    last_name: signerLastName,\n                    email: signerEmail,\n                    locale: 'en'\n                },\n                signature_level: 'qualified_electronic_signature'\n            })\n        });\n        if (!signerResponse.ok) {\n            const errorJson = await signerResponse.json();\n            console.error('Failed to create signer:', errorJson);\n            return Response.json({\n                error: errorJson\n            }, {\n                status: signerResponse.status\n            });\n        }\n        const signer = await signerResponse.json();\n        const signerId = signer['id'];\n        // Adding signature field\n        const fieldResponse = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/documents/${documentId}/fields`, {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                'Content-Type': 'application/json',\n                Accept: 'application/json'\n            },\n            body: JSON.stringify({\n                type: 'signature',\n                signer_id: signerId,\n                \"page\": 1,\n                \"width\": 99,\n                \"height\": 39,\n                \"x\": 400,\n                \"y\": 545\n            })\n        });\n        // Start signature request\n        const startResponse = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(`https://api-sandbox.yousign.app/v3/signature_requests/${signatureRequestId}/activate`, {\n            method: 'POST',\n            headers: {\n                Authorization: `Bearer ${apiKey}`,\n                Accept: 'application/json'\n            }\n        });\n        const started = await startResponse.json();\n        const signatureLink = started.signers?.[0]?.signature_link;\n        return new Response(JSON.stringify({\n            signatureLink,\n            signatureRequestId\n        }), {\n            status: 200,\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        });\n    } catch (error) {\n        console.error('Error:', error);\n        return new Response(JSON.stringify({\n            error: error.message\n        }), {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3lvdXNpZ24vc3RhcnQtc2lnbmluZy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBa0M7QUFDSDtBQUNQO0FBQ1M7QUFDSDtBQUNJO0FBRzFCLGVBQWVNLEtBQUtDLE9BQWdCO0lBQzFDLElBQUk7UUFDRixNQUFNQyxPQUFPLE1BQU1ELFFBQVFFLElBQUk7UUFDL0IsTUFBTSxFQUFFQyxlQUFlLEVBQUVDLGNBQWMsRUFBRUMsV0FBVyxFQUFFLEdBQUdKO1FBRXpELE1BQU1LLFNBQVNDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtRQUMxQyxNQUFNQyxVQUFVZixnREFBUyxDQUFDWSxRQUFRSyxHQUFHLElBQUksT0FBTztRQUVoRCwyQ0FBMkM7UUFDM0MsTUFBTUMsa0JBQWtCLE1BQU1uQixzREFBS0EsQ0FBQyx5REFBeUQ7WUFDM0ZvQixRQUFRO1lBQ1JDLFNBQVM7Z0JBQ1BDLGVBQWUsQ0FBQyxPQUFPLEVBQUVWLFFBQVE7Z0JBQ2pDLGdCQUFnQjtnQkFDaEJXLFFBQVE7WUFDVjtZQUNBaEIsTUFBTWlCLEtBQUtDLFNBQVMsQ0FBQztnQkFDbkJDLGlCQUFrQjtnQkFDbEJDLE1BQU07Z0JBQ05DLGVBQWU7WUFDakI7UUFDRjtRQUVBLElBQUksQ0FBQ1QsZ0JBQWdCVSxFQUFFLEVBQUU7WUFDdkIsTUFBTUMsVUFBVSxNQUFNWCxnQkFBZ0JZLElBQUk7WUFDMUNDLFFBQVFDLEtBQUssQ0FBQyxzQ0FBc0NIO1lBQ3BELE9BQU8sSUFBSUksU0FBU1YsS0FBS0MsU0FBUyxDQUFDO2dCQUFFUSxPQUFPO2dCQUFxQ0UsU0FBU0w7WUFBUSxJQUFJO2dCQUFFTSxRQUFRO1lBQUk7UUFDdEg7UUFFQSxNQUFNQyxtQkFBbUIsTUFBTWxCLGdCQUFnQlgsSUFBSTtRQUNuRCxNQUFNOEIscUJBQXFCRCxnQkFBZ0IsQ0FBQyxLQUFLO1FBRWpELHNDQUFzQztRQUN0QyxNQUFNRSxjQUFjeEMsZ0RBQVlBLENBQUNpQjtRQUNqQyxNQUFN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UUFBUUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFQztRQUU1QyxPQUFPLElBQUlsQyxTQUNUVixLQUFLQyxTQUFTLENBQUM7WUFDWnlDO1lBQ0E1QjtRQUNELElBQ0Y7WUFDQUYsUUFBUTtZQUNSZixTQUFTO2dCQUNQLGdCQUFnQjtZQUNsQjtRQUNGO0lBR0EsRUFBRSxPQUFPWSxPQUFZO1FBQ25CRCxRQUFRQyxLQUFLLENBQUMsVUFBVUE7UUFDeEIsT0FBTyxJQUFJQyxTQUFTVixLQUFLQyxTQUFTLENBQUM7WUFBRVEsT0FBT0EsTUFBTW9DLE9BQU87UUFBQyxJQUFJO1lBQUVqQyxRQUFRO1FBQUk7SUFDOUU7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxEbWl0cnlLaXBvcmVua29cXERlc2t0b3BcXG5ld1xcc3Vic2NyaXB0aW9ucy1VQUhcXGFwcFxcYXBpXFx5b3VzaWduXFxzdGFydC1zaWduaW5nXFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCBmZXRjaCBmcm9tICdub2RlLWZldGNoJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBGb3JtRGF0YSBmcm9tICdmb3JtLWRhdGEnO1xyXG5pbXBvcnQgeyBCbG9iIH0gZnJvbSAnYnVmZmVyJzsgXHJcbmltcG9ydCB7IFJlYWRhYmxlIH0gZnJvbSAnc3RyZWFtJzsgXHJcbiBcclxuIFxyXG4gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XHJcbiAgICBjb25zdCB7IHNpZ25lckZpcnN0TmFtZSwgc2lnbmVyTGFzdE5hbWUsIHNpZ25lckVtYWlsIH0gPSBib2R5O1xyXG4gICAgXHJcbiAgICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5ZT1VTSUdOX0FQSV9LRVkhO1xyXG4gICAgY29uc3QgcGRmUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnYXBwJywgJ1Rlcm1zLnBkZicpO1xyXG4gICAgICBcclxuICAgIC8vIC0tLSBTdGVwIDE6IENyZWF0ZSBTaWduYXR1cmUgUmVxdWVzdCAtLS1cclxuICAgIGNvbnN0IHNpZ25hdHVyZVJlcVJlcyA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS1zYW5kYm94LnlvdXNpZ24uYXBwL3YzL3NpZ25hdHVyZV9yZXF1ZXN0cycsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIG9yZGVyZWRfc2lnbmVycyA6IHRydWUsXHJcbiAgICAgICAgbmFtZTogJ1Rlcm1zIEFncmVlbWVudCcsXHJcbiAgICAgICAgZGVsaXZlcnlfbW9kZTogJ2VtYWlsJyxcclxuICAgICAgfSksXHJcbiAgICB9KTtcclxuIFxyXG4gICAgaWYgKCFzaWduYXR1cmVSZXFSZXMub2spIHtcclxuICAgICAgY29uc3QgZXJyVGV4dCA9IGF3YWl0IHNpZ25hdHVyZVJlcVJlcy50ZXh0KCk7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NpZ25hdHVyZSByZXF1ZXN0IGNyZWF0aW9uIGZhaWxlZDonLCBlcnJUZXh0KTtcclxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnU2lnbmF0dXJlIHJlcXVlc3QgY3JlYXRpb24gZmFpbGVkJywgZGV0YWlsczogZXJyVGV4dCB9KSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICAgIH1cclxuIFxyXG4gICAgY29uc3Qgc2lnbmF0dXJlUmVxSnNvbiA9IGF3YWl0IHNpZ25hdHVyZVJlcVJlcy5qc29uKCk7XHJcbiAgICBjb25zdCBzaWduYXR1cmVSZXF1ZXN0SWQgPSBzaWduYXR1cmVSZXFKc29uWydpZCddO1xyXG5cclxuICAgIC8vYWRkaW5nIFBERiBmaWxlIHRvIHNpZ25hdHVyZSByZXF1ZXN0XHJcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhwZGZQYXRoKTtcclxuICAgIGNvbnN0IGZpbGVCbG9iID0gbmV3IEJsb2IoW2ZpbGVDb250ZW50XSk7XHJcbiAgICBjb25zdCBmaWxlU3RyZWFtID0gUmVhZGFibGUuZnJvbVdlYihmaWxlQmxvYi5zdHJlYW0oKSBhcyBhbnkpO1xyXG4gICAgY29uc3QgZm9ybSA9IG5ldyBGb3JtRGF0YSgpO1xyXG5cclxuICAgIGZvcm0uYXBwZW5kKCdmaWxlJywgZmlsZVN0cmVhbSwge1xyXG4gICAgICBmaWxlbmFtZTogJ1Rlcm1zLnBkZicsXHJcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vcGRmJyxcclxuICAgIH0pO1xyXG4gICAgZm9ybS5hcHBlbmQoJ25hbWUnLCAnVGVybXMucGRmJyk7XHJcbiAgICBmb3JtLmFwcGVuZCgnbmF0dXJlJywgJ3NpZ25hYmxlX2RvY3VtZW50Jyk7XHJcbiBcclxuICAgIGNvbnN0IGRvY01ldGFSZXMgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGktc2FuZGJveC55b3VzaWduLmFwcC92My9zaWduYXR1cmVfcmVxdWVzdHMvJHtzaWduYXR1cmVSZXF1ZXN0SWR9L2RvY3VtZW50c2AsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXHJcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IGZvcm0sXHJcbiAgICB9KTtcclxuIFxyXG4gICAgY29uc3QgZG9jdW1lbnQgPSBhd2FpdCBkb2NNZXRhUmVzLmpzb24oKTtcclxuICAgIGNvbnN0IGRvY3VtZW50SWQgPSBkb2N1bWVudFsnaWQnXTtcclxuICBcclxuICAgIGlmICghZG9jTWV0YVJlcy5vaykge1xyXG4gICAgICBjb25zdCBlcnJUZXh0ID0gYXdhaXQgZG9jTWV0YVJlcy50ZXh0KCk7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0RvY3VtZW50IG1ldGFkYXRhIGNyZWF0aW9uIGZhaWxlZDonLCBlcnJUZXh0KTtcclxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0YWRhdGEgY3JlYXRpb24gZmFpbGVkJywgZGV0YWlsczogZXJyVGV4dCB9KSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICAgIH1cclxuIFxyXG4gICAgLy8gQWRkaW5nIHNpZ25lclxyXG4gICAgICBjb25zdCBzaWduZXJSZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS1zYW5kYm94LnlvdXNpZ24uYXBwL3YzL3NpZ25hdHVyZV9yZXF1ZXN0cy8ke3NpZ25hdHVyZVJlcXVlc3RJZH0vc2lnbmVyc2AsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgfSxcclxuICAgICBcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICBpbmZvOiB7XHJcbiAgICAgICAgICBmaXJzdF9uYW1lOiBzaWduZXJGaXJzdE5hbWUsXHJcbiAgICAgICAgICBsYXN0X25hbWU6IHNpZ25lckxhc3ROYW1lLFxyXG4gICAgICAgICAgZW1haWw6IHNpZ25lckVtYWlsLFxyXG4gICAgICAgICAgbG9jYWxlOiAnZW4nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaWduYXR1cmVfbGV2ZWw6ICdxdWFsaWZpZWRfZWxlY3Ryb25pY19zaWduYXR1cmUnLFxyXG4gICAgICB9KSxcclxuICAgIH0pO1xyXG4gXHJcbiAgICBpZiAoIXNpZ25lclJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIGNvbnN0IGVycm9ySnNvbiA9IGF3YWl0IHNpZ25lclJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzaWduZXI6JywgZXJyb3JKc29uKTtcclxuICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBlcnJvcjogZXJyb3JKc29uIH0sIHsgc3RhdHVzOiBzaWduZXJSZXNwb25zZS5zdGF0dXMgfSk7XHJcbiAgICB9XHJcbiBcclxuICAgIGNvbnN0IHNpZ25lciA9IGF3YWl0IHNpZ25lclJlc3BvbnNlLmpzb24oKTtcclxuICAgIGNvbnN0IHNpZ25lcklkID0gc2lnbmVyWydpZCddO1xyXG4gXHJcbiAgICAvLyBBZGRpbmcgc2lnbmF0dXJlIGZpZWxkXHJcbiAgICBjb25zdCBmaWVsZFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLXNhbmRib3gueW91c2lnbi5hcHAvdjMvc2lnbmF0dXJlX3JlcXVlc3RzLyR7c2lnbmF0dXJlUmVxdWVzdElkfS9kb2N1bWVudHMvJHtkb2N1bWVudElkfS9maWVsZHNgLCB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICB0eXBlOiAnc2lnbmF0dXJlJyxcclxuICAgICAgICBzaWduZXJfaWQ6IHNpZ25lcklkLFxyXG4gICAgICAgIFwicGFnZVwiOiAxLFxyXG4gICAgICAgIFwid2lkdGhcIjogOTksXHJcbiAgICAgICAgXCJoZWlnaHRcIjogMzksXHJcbiAgICAgICAgXCJ4XCI6IDQwMCxcclxuICAgICAgICBcInlcIjogNTQ1XHJcbiAgICAgIH0pLFxyXG4gICAgfSk7XHJcbiBcclxuICAgIC8vIFN0YXJ0IHNpZ25hdHVyZSByZXF1ZXN0XHJcbiAgICBjb25zdCBzdGFydFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLXNhbmRib3gueW91c2lnbi5hcHAvdjMvc2lnbmF0dXJlX3JlcXVlc3RzLyR7c2lnbmF0dXJlUmVxdWVzdElkfS9hY3RpdmF0ZWAsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxyXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gXHJcbiAgY29uc3Qgc3RhcnRlZCA9IGF3YWl0IHN0YXJ0UmVzcG9uc2UuanNvbigpIGFzIHtcclxuICAgIHNpZ25lcnM/OiB7XHJcbiAgICAgIHNpZ25hdHVyZV9saW5rPzogc3RyaW5nO1xyXG4gICAgfVtdO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNpZ25hdHVyZUxpbmsgPSBzdGFydGVkLnNpZ25lcnM/LlswXT8uc2lnbmF0dXJlX2xpbms7XHJcbiBcclxuICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgc2lnbmF0dXJlTGluayxcclxuICAgICAgIHNpZ25hdHVyZVJlcXVlc3RJZCxcclxuICAgICAgfSksXHJcbiAgICB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgIH0sXHJcbiAgfVxyXG4gICk7XHJcbiBcclxuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSksIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJyZWFkRmlsZVN5bmMiLCJmZXRjaCIsInBhdGgiLCJGb3JtRGF0YSIsIkJsb2IiLCJSZWFkYWJsZSIsIlBPU1QiLCJyZXF1ZXN0IiwiYm9keSIsImpzb24iLCJzaWduZXJGaXJzdE5hbWUiLCJzaWduZXJMYXN0TmFtZSIsInNpZ25lckVtYWlsIiwiYXBpS2V5IiwicHJvY2VzcyIsImVudiIsIllPVVNJR05fQVBJX0tFWSIsInBkZlBhdGgiLCJqb2luIiwiY3dkIiwic2lnbmF0dXJlUmVxUmVzIiwibWV0aG9kIiwiaGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJBY2NlcHQiLCJKU09OIiwic3RyaW5naWZ5Iiwib3JkZXJlZF9zaWduZXJzIiwibmFtZSIsImRlbGl2ZXJ5X21vZGUiLCJvayIsImVyclRleHQiLCJ0ZXh0IiwiY29uc29sZSIsImVycm9yIiwiUmVzcG9uc2UiLCJkZXRhaWxzIiwic3RhdHVzIiwic2lnbmF0dXJlUmVxSnNvbiIsInNpZ25hdHVyZVJlcXVlc3RJZCIsImZpbGVDb250ZW50IiwiZmlsZUJsb2IiLCJmaWxlU3RyZWFtIiwiZnJvbVdlYiIsInN0cmVhbSIsImZvcm0iLCJhcHBlbmQiLCJmaWxlbmFtZSIsImNvbnRlbnRUeXBlIiwiZG9jTWV0YVJlcyIsImRvY3VtZW50IiwiZG9jdW1lbnRJZCIsInNpZ25lclJlc3BvbnNlIiwiaW5mbyIsImZpcnN0X25hbWUiLCJsYXN0X25hbWUiLCJlbWFpbCIsImxvY2FsZSIsInNpZ25hdHVyZV9sZXZlbCIsImVycm9ySnNvbiIsInNpZ25lciIsInNpZ25lcklkIiwiZmllbGRSZXNwb25zZSIsInR5cGUiLCJzaWduZXJfaWQiLCJzdGFydFJlc3BvbnNlIiwic3RhcnRlZCIsInNpZ25hdHVyZUxpbmsiLCJzaWduZXJzIiwic2lnbmF0dXJlX2xpbmsiLCJtZXNzYWdlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/yousign/start-signing/route.ts\n");

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