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
exports.id = "app/api/invoice/[customerId]/pdf/route";
exports.ids = ["app/api/invoice/[customerId]/pdf/route"];
exports.modules = {

/***/ "(rsc)/./app/api/invoice/[customerId]/pdf/route.ts":
/*!***************************************************!*\
  !*** ./app/api/invoice/[customerId]/pdf/route.ts ***!
  \***************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs/promises */ \"fs/promises\");\n/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs_promises__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var puppeteer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! puppeteer */ \"puppeteer\");\n/* harmony import */ var handlebars__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! handlebars */ \"(rsc)/./node_modules/handlebars/lib/index.js\");\n/* harmony import */ var handlebars__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(handlebars__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([puppeteer__WEBPACK_IMPORTED_MODULE_3__]);\npuppeteer__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_5__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: '2025-06-30.basil'\n});\nasync function GET(req, { params }) {\n    const { customerId } = await params;\n    try {\n        const invoices = await stripe.invoices.list({\n            customer: customerId,\n            status: 'paid',\n            limit: 1,\n            expand: [\n                'data.customer',\n                'data.lines.data.price'\n            ]\n        });\n        console.log('CustomerID who is making a purchase:', customerId);\n        if (!invoices.data.length) {\n            return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse('No paid invoices found.', {\n                status: 404\n            });\n        }\n        const invoice = invoices.data[0];\n        const logoSVG = await (0,fs_promises__WEBPACK_IMPORTED_MODULE_1__.readFile)(path__WEBPACK_IMPORTED_MODULE_2___default().join(process.cwd(), 'public/uah-logo-gradient.svg'), 'utf8');\n        const htmlTemplate = await (0,fs_promises__WEBPACK_IMPORTED_MODULE_1__.readFile)(path__WEBPACK_IMPORTED_MODULE_2___default().join(process.cwd(), 'templates/invoice-template.html'), 'utf8');\n        const customDescriptions = {\n            'price_1RTdrCRj81djxho2lPgusn15': 'Basic EU Market Subscription',\n            'price_1ReZxiRj81djxho2Y2eKJrjX': 'Surcharge on products inquiries',\n            'price_1ReZwRRj81djxho245KNRdtH': 'Direct standard surcharge',\n            'price_1ReZv3Rj81djxho2URzgonU0': 'Surcharge on negotiated pricing',\n            'price_1RebRBRj81djxho2QGzi8dvB': 'Direct high volume surcharge'\n        };\n        const customDescriptionsDetails = {\n            'price_1RTdrCRj81djxho2lPgusn15': 'standard fixed rate',\n            'price_1ReZxiRj81djxho2Y2eKJrjX': '(€0.0000833 EUR per unit / month)',\n            'price_1ReZwRRj81djxho245KNRdtH': '(€0.0000667 EUR per unit / month)',\n            'price_1ReZv3Rj81djxho2URzgonU0': '(€0.0000333 EUR per unit / month)',\n            'price_1RebRBRj81djxho2QGzi8dvB': '(€0.00005 EUR per unit / month)'\n        };\n        const data = {\n            invoice: {\n                logo_svg: logoSVG,\n                number: invoice.number,\n                date_issued: new Date(invoice.created * 1000).toLocaleDateString('en-GB', {\n                    dateStyle: 'long'\n                }),\n                due_date: new Date(invoice.created * 1000).toLocaleDateString('en-GB', {\n                    dateStyle: 'long'\n                }),\n                total: (invoice.amount_due / 100).toFixed(2),\n                hosted_invoice_url: invoice.hosted_invoice_url,\n                customer_name: typeof invoice.customer === 'object' && 'name' in invoice.customer && invoice.customer.name ? invoice.customer.name : invoice.customer_name || 'N/A',\n                customer_email: typeof invoice.customer === 'object' && 'email' in invoice.customer && invoice.customer.email ? invoice.customer.email : invoice.customer_email || 'N/A',\n                seller_name: \"UAH Marketplace Test\",\n                seller_address: \"02796 Kurort Jonsdorf\",\n                seller_country: \"Germany\",\n                seller_email: \"sandbox@accessible.stripe.com\",\n                lines: invoice.lines.data.map((line)=>{\n                    const priceId = line.pricing.price_details.price;\n                    const customDescription = customDescriptions[priceId];\n                    const customDescriptionDetails = customDescriptionsDetails[priceId];\n                    return {\n                        description: customDescription ?? line.description,\n                        unit_price: (line.quantity ? line.amount / line.quantity / 100 : line.amount / 100).toFixed(2),\n                        total: (line.amount / 100).toFixed(2),\n                        description_details: customDescriptionDetails ?? '',\n                        period: line.period ? `${new Date(line.period.start * 1000).toLocaleDateString('en-GB', {\n                            dateStyle: 'medium'\n                        })} – ${new Date(line.period.end * 1000).toLocaleDateString('en-GB', {\n                            dateStyle: 'medium'\n                        })}` : ''\n                    };\n                })\n            }\n        };\n        const template = handlebars__WEBPACK_IMPORTED_MODULE_4___default().compile(htmlTemplate);\n        const html = template(data);\n        const browser = await puppeteer__WEBPACK_IMPORTED_MODULE_3__[\"default\"].launch({\n            headless: true,\n            args: [\n                '--no-sandbox',\n                '--disable-setuid-sandbox'\n            ]\n        });\n        const page = await browser.newPage();\n        await page.setContent(html, {\n            waitUntil: 'networkidle0'\n        });\n        const pdfBuffer = await page.pdf({\n            format: 'A4',\n            printBackground: true,\n            margin: {\n                top: '30mm',\n                bottom: '20mm',\n                left: '20mm',\n                right: '20mm'\n            }\n        });\n        await browser.close();\n        return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(pdfBuffer, {\n            status: 200,\n            headers: {\n                'Content-Type': 'application/pdf',\n                'Content-Disposition': `attachment; filename=\"invoice-${invoice.number}.pdf\"`\n            }\n        });\n    } catch (error) {\n        console.error('PDF generation error:', error);\n        return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(`Error: ${error.message}`, {\n            status: 500\n        });\n    }\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2ludm9pY2UvW2N1c3RvbWVySWRdL3BkZi9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXdEO0FBQ2pCO0FBQ2Y7QUFDVTtBQUNFO0FBQ1I7QUFFNUIsTUFBTU0sU0FBUyxJQUFJRCw4Q0FBTUEsQ0FBQ0UsUUFBUUMsR0FBRyxDQUFDQyxpQkFBaUIsRUFBRztJQUN4REMsWUFBWTtBQUNkO0FBRU8sZUFBZUMsSUFBSUMsR0FBZ0IsRUFBRSxFQUFFQyxNQUFNLEVBQXNDO0lBQ3hGLE1BQU0sRUFBRUMsVUFBVSxFQUFFLEdBQUcsTUFBTUQ7SUFFN0IsSUFBSTtRQUNGLE1BQU1FLFdBQVcsTUFBTVQsT0FBT1MsUUFBUSxDQUFDQyxJQUFJLENBQUM7WUFDMUNDLFVBQVVIO1lBQ1ZJLFFBQVE7WUFDUkMsT0FBTztZQUNQQyxRQUFRO2dCQUFDO2dCQUFpQjthQUF3QjtRQUNwRDtRQUVBQyxRQUFRQyxHQUFHLENBQUMsd0NBQXdDUjtRQUNwRCxJQUFJLENBQUNDLFNBQVNRLElBQUksQ0FBQ0MsTUFBTSxFQUFFO1lBQ3pCLE9BQU8sSUFBSXhCLHFEQUFZQSxDQUFDLDJCQUEyQjtnQkFBRWtCLFFBQVE7WUFBSTtRQUNuRTtRQUVBLE1BQU1PLFVBQVVWLFNBQVNRLElBQUksQ0FBQyxFQUFFO1FBRWhDLE1BQU1HLFVBQVUsTUFBTXpCLHFEQUFRQSxDQUFDQyxnREFBUyxDQUFDSyxRQUFRcUIsR0FBRyxJQUFJLGlDQUFpQztRQUN6RixNQUFNQyxlQUFlLE1BQU01QixxREFBUUEsQ0FBQ0MsZ0RBQVMsQ0FBQ0ssUUFBUXFCLEdBQUcsSUFBSSxvQ0FBb0M7UUFFakcsTUFBTUUscUJBQTZDO1lBQ2pELGtDQUFrQztZQUNsQyxrQ0FBa0M7WUFDbEMsa0NBQWtDO1lBQ2xDLGtDQUFrQztZQUNsQyxrQ0FBa0M7UUFDcEM7UUFFQSxNQUFNQyw0QkFBb0Q7WUFDeEQsa0NBQWtDO1lBQ2xDLGtDQUFrQztZQUNsQyxrQ0FBa0M7WUFDbEMs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UTtZQUNSd0UsU0FBUztnQkFDUCxnQkFBZ0I7Z0JBQ2hCLHVCQUF1QixDQUFDLDhCQUE4QixFQUFFakUsUUFBUVEsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMvRTtRQUNGO0lBQ0YsRUFBRSxPQUFPMEQsT0FBWTtRQUNuQnRFLFFBQVFzRSxLQUFLLENBQUMseUJBQXlCQTtRQUN2QyxPQUFPLElBQUkzRixxREFBWUEsQ0FBQyxDQUFDLE9BQU8sRUFBRTJGLE1BQU1DLE9BQU8sRUFBRSxFQUFFO1lBQUUxRSxRQUFRO1FBQUk7SUFDbkU7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxEbWl0cnlLaXBvcmVua29cXERlc2t0b3BcXG5ld1xcc3Vic2NyaXB0aW9ucy1VQUhcXGFwcFxcYXBpXFxpbnZvaWNlXFxbY3VzdG9tZXJJZF1cXHBkZlxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcclxuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICdmcy9wcm9taXNlcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgcHVwcGV0ZWVyIGZyb20gJ3B1cHBldGVlcic7XHJcbmltcG9ydCBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xyXG5pbXBvcnQgU3RyaXBlIGZyb20gJ3N0cmlwZSc7XHJcblxyXG5jb25zdCBzdHJpcGUgPSBuZXcgU3RyaXBlKHByb2Nlc3MuZW52LlNUUklQRV9TRUNSRVRfS0VZISwge1xyXG4gIGFwaVZlcnNpb246ICcyMDI1LTA2LTMwLmJhc2lsJyxcclxufSk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcTogTmV4dFJlcXVlc3QsIHsgcGFyYW1zIH06IHsgcGFyYW1zOiB7IGN1c3RvbWVySWQ6IHN0cmluZyB9IH0pIHtcclxuICBjb25zdCB7IGN1c3RvbWVySWQgfSA9IGF3YWl0IHBhcmFtcztcclxuICBcclxuICB0cnkge1xyXG4gICAgY29uc3QgaW52b2ljZXMgPSBhd2FpdCBzdHJpcGUuaW52b2ljZXMubGlzdCh7XHJcbiAgICAgIGN1c3RvbWVyOiBjdXN0b21lcklkLFxyXG4gICAgICBzdGF0dXM6ICdwYWlkJyxcclxuICAgICAgbGltaXQ6IDEsXHJcbiAgICAgIGV4cGFuZDogWydkYXRhLmN1c3RvbWVyJywgJ2RhdGEubGluZXMuZGF0YS5wcmljZSddLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ0N1c3RvbWVySUQgd2hvIGlzIG1ha2luZyBhIHB1cmNoYXNlOicsIGN1c3RvbWVySWQpO1xyXG4gICAgaWYgKCFpbnZvaWNlcy5kYXRhLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gbmV3IE5leHRSZXNwb25zZSgnTm8gcGFpZCBpbnZvaWNlcyBmb3VuZC4nLCB7IHN0YXR1czogNDA0IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGludm9pY2UgPSBpbnZvaWNlcy5kYXRhWzBdO1xyXG5cclxuICAgIGNvbnN0IGxvZ29TVkcgPSBhd2FpdCByZWFkRmlsZShwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3B1YmxpYy91YWgtbG9nby1ncmFkaWVudC5zdmcnKSwgJ3V0ZjgnKTtcclxuICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IHJlYWRGaWxlKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAndGVtcGxhdGVzL2ludm9pY2UtdGVtcGxhdGUuaHRtbCcpLCAndXRmOCcpO1xyXG5cclxuICAgIGNvbnN0IGN1c3RvbURlc2NyaXB0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgJ3ByaWNlXzFSVGRyQ1JqODFkanhobzJsUGd1c24xNSc6ICdCYXNpYyBFVSBNYXJrZXQgU3Vic2NyaXB0aW9uJyxcclxuICAgICAgJ3ByaWNlXzFSZVp4aVJqODFkanhobzJZMmVLSnJqWCc6ICdTdXJjaGFyZ2Ugb24gcHJvZHVjdHMgaW5xdWlyaWVzJyxcclxuICAgICAgJ3ByaWNlXzFSZVp3UlJqODFkanhobzI0NUtOUmR0SCc6ICdEaXJlY3Qgc3RhbmRhcmQgc3VyY2hhcmdlJyxcclxuICAgICAgJ3ByaWNlXzFSZVp2M1JqODFkanhobzJVUnpnb25VMCc6ICdTdXJjaGFyZ2Ugb24gbmVnb3RpYXRlZCBwcmljaW5nJyxcclxuICAgICAgJ3ByaWNlXzFSZWJSQlJqODFkanhobzJRR3ppOGR2Qic6ICdEaXJlY3QgaGlnaCB2b2x1bWUgc3VyY2hhcmdlJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY3VzdG9tRGVzY3JpcHRpb25zRGV0YWlsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgJ3ByaWNlXzFSVGRyQ1JqODFkanhobzJsUGd1c24xNSc6ICdzdGFuZGFyZCBmaXhlZCByYXRlJyxcclxuICAgICAgJ3ByaWNlXzFSZVp4aVJqODFkanhobzJZMmVLSnJqWCc6ICco4oKsMC4wMDAwODMzIEVVUiBwZXIgdW5pdCAvIG1vbnRoKScsXHJcbiAgICAgICdwcmljZV8xUmVad1JSajgxZGp4aG8yNDVLTlJkdEgnOiAnKOKCrDAuMDAwMDY2NyBFVVIgcGVyIHVuaXQgLyBtb250aCknLFxyXG4gICAgICAncHJpY2VfMVJlWnYzUmo4MWRqeGhvMlVSemdvblUwJzogJyjigqwwLjAwMDAzMzMgRVVSIHBlciB1bml0IC8gbW9udGgpJyxcclxuICAgICAgJ3ByaWNlXzFSZWJSQlJqODFkanhobzJRR3ppOGR2Qic6ICco4oKsMC4wMDAwNSBFVVIgcGVyIHVuaXQgLyBtb250aCknLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICBpbnZvaWNlOiB7XHJcbiAgICAgICAgbG9nb19zdmc6IGxvZ29TVkcsXHJcbiAgICAgICAgbnVtYmVyOiBpbnZvaWNlLm51bWJlcixcclxuICAgICAgICBkYXRlX2lzc3VlZDogbmV3IERhdGUoaW52b2ljZS5jcmVhdGVkICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1HQicsIHsgZGF0ZVN0eWxlOiAnbG9uZycgfSksXHJcbiAgICAgICAgZHVlX2RhdGU6IG5ldyBEYXRlKGludm9pY2UuY3JlYXRlZCAqIDEwMDApLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tR0InLCB7IGRhdGVTdHlsZTogJ2xvbmcnIH0pLFxyXG4gICAgICAgIHRvdGFsOiAoaW52b2ljZS5hbW91bnRfZHVlIC8gMTAwKS50b0ZpeGVkKDIpLFxyXG4gICAgICAgIGhvc3RlZF9pbnZvaWNlX3VybDogaW52b2ljZS5ob3N0ZWRfaW52b2ljZV91cmwsXHJcbiAgICAgICAgY3VzdG9tZXJfbmFtZTpcclxuICAgICAgICAgICAgdHlwZW9mIGludm9pY2UuY3VzdG9tZXIgPT09ICdvYmplY3QnICYmICduYW1lJyBpbiBpbnZvaWNlLmN1c3RvbWVyICYmIGludm9pY2UuY3VzdG9tZXIubmFtZVxyXG4gICAgICAgICAgICAgICAgPyBpbnZvaWNlLmN1c3RvbWVyLm5hbWVcclxuICAgICAgICAgICAgICAgIDogaW52b2ljZS5jdXN0b21lcl9uYW1lIHx8ICdOL0EnLFxyXG5cclxuICAgICAgICBjdXN0b21lcl9lbWFpbDogXHJcbiAgICAgICAgICAgIHR5cGVvZiBpbnZvaWNlLmN1c3RvbWVyID09PSAnb2JqZWN0JyAmJiAnZW1haWwnIGluIGludm9pY2UuY3VzdG9tZXIgJiYgaW52b2ljZS5jdXN0b21lci5lbWFpbFxyXG4gICAgICAgICAgICAgICAgPyBpbnZvaWNlLmN1c3RvbWVyLmVtYWlsXHJcbiAgICAgICAgICAgICAgICA6IGludm9pY2UuY3VzdG9tZXJfZW1haWwgfHwgJ04vQScsXHJcblxyXG4gICAgICAgIHNlbGxlcl9uYW1lOiBcIlVBSCBNYXJrZXRwbGFjZSBUZXN0XCIsXHJcbiAgICAgICAgc2VsbGVyX2FkZHJlc3M6IFwiMDI3OTYgS3Vyb3J0IEpvbnNkb3JmXCIsXHJcbiAgICAgICAgc2VsbGVyX2NvdW50cnk6IFwiR2VybWFueVwiLFxyXG4gICAgICAgIHNlbGxlcl9lbWFpbDogXCJzYW5kYm94QGFjY2Vzc2libGUuc3RyaXBlLmNvbVwiLFxyXG4gICAgICAgIGxpbmVzOiBpbnZvaWNlLmxpbmVzLmRhdGEubWFwKChsaW5lOiBhbnkpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHByaWNlSWQgPSBsaW5lLnByaWNpbmcucHJpY2VfZGV0YWlscy5wcmljZTtcclxuICAgICAgICAgIGNvbnN0IGN1c3RvbURlc2NyaXB0aW9uID0gY3VzdG9tRGVzY3JpcHRpb25zW3ByaWNlSWRdO1xyXG4gICAgICAgICAgY29uc3QgY3VzdG9tRGVzY3JpcHRpb25EZXRhaWxzID0gY3VzdG9tRGVzY3JpcHRpb25zRGV0YWlsc1twcmljZUlkXTtcclxuICBcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjdXN0b21EZXNjcmlwdGlvbiA/PyBsaW5lLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICB1bml0X3ByaWNlOiAobGluZS5xdWFudGl0eSA/IChsaW5lLmFtb3VudCAvIGxpbmUucXVhbnRpdHkgLyAxMDApIDogKGxpbmUuYW1vdW50IC8gMTAwKSkudG9GaXhlZCgyKSxcclxuICAgICAgICAgICAgdG90YWw6IChsaW5lLmFtb3VudCAvIDEwMCkudG9GaXhlZCgyKSxcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uX2RldGFpbHM6IGN1c3RvbURlc2NyaXB0aW9uRGV0YWlscyA/PyAnJyxcclxuXHJcbiAgICAgICAgICAgIHBlcmlvZDogbGluZS5wZXJpb2RcclxuICAgICAgICAgICAgICA/IGAke25ldyBEYXRlKGxpbmUucGVyaW9kLnN0YXJ0ICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1HQicsIHsgZGF0ZVN0eWxlOiAnbWVkaXVtJyB9KX0g4oCTICR7bmV3IERhdGUobGluZS5wZXJpb2QuZW5kICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1HQicsIHsgZGF0ZVN0eWxlOiAnbWVkaXVtJyB9KX1gXHJcbiAgICAgICAgICAgICAgOiAnJyxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKGh0bWxUZW1wbGF0ZSk7XHJcbiAgICBjb25zdCBodG1sID0gdGVtcGxhdGUoZGF0YSk7XHJcblxyXG4gICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHB1cHBldGVlci5sYXVuY2goe1xyXG4gICAgICBoZWFkbGVzczogdHJ1ZSxcclxuICAgICAgYXJnczogWyctLW5vLXNhbmRib3gnLCAnLS1kaXNhYmxlLXNldHVpZC1zYW5kYm94J10sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XHJcbiAgICBhd2FpdCBwYWdlLnNldENvbnRlbnQoaHRtbCwgeyB3YWl0VW50aWw6ICduZXR3b3JraWRsZTAnIH0pO1xyXG5cclxuICAgIGNvbnN0IHBkZkJ1ZmZlciA9IGF3YWl0IHBhZ2UucGRmKHtcclxuICAgICAgZm9ybWF0OiAnQTQnLFxyXG4gICAgICBwcmludEJhY2tncm91bmQ6IHRydWUsXHJcbiAgICAgIG1hcmdpbjogeyB0b3A6ICczMG1tJywgYm90dG9tOiAnMjBtbScsIGxlZnQ6ICcyMG1tJywgcmlnaHQ6ICcyMG1tJyB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xyXG5cclxuICAgIHJldHVybiBuZXcgTmV4dFJlc3BvbnNlKHBkZkJ1ZmZlciwge1xyXG4gICAgICBzdGF0dXM6IDIwMCxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vcGRmJyxcclxuICAgICAgICAnQ29udGVudC1EaXNwb3NpdGlvbic6IGBhdHRhY2htZW50OyBmaWxlbmFtZT1cImludm9pY2UtJHtpbnZvaWNlLm51bWJlcn0ucGRmXCJgLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgY29uc29sZS5lcnJvcignUERGIGdlbmVyYXRpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIG5ldyBOZXh0UmVzcG9uc2UoYEVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YCwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInJlYWRGaWxlIiwicGF0aCIsInB1cHBldGVlciIsIkhhbmRsZWJhcnMiLCJTdHJpcGUiLCJzdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVF9LRVkiLCJhcGlWZXJzaW9uIiwiR0VUIiwicmVxIiwicGFyYW1zIiwiY3VzdG9tZXJJZCIsImludm9pY2VzIiwibGlzdCIsImN1c3RvbWVyIiwic3RhdHVzIiwibGltaXQiLCJleHBhbmQiLCJjb25zb2xlIiwibG9nIiwiZGF0YSIsImxlbmd0aCIsImludm9pY2UiLCJsb2dvU1ZHIiwiam9pbiIsImN3ZCIsImh0bWxUZW1wbGF0ZSIsImN1c3RvbURlc2NyaXB0aW9ucyIsImN1c3RvbURlc2NyaXB0aW9uc0RldGFpbHMiLCJsb2dvX3N2ZyIsIm51bWJlciIsImRhdGVfaXNzdWVkIiwiRGF0ZSIsImNyZWF0ZWQiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJkYXRlU3R5bGUiLCJkdWVfZGF0ZSIsInRvdGFsIiwiYW1vdW50X2R1ZSIsInRvRml4ZWQiLCJob3N0ZWRfaW52b2ljZV91cmwiLCJjdXN0b21lcl9uYW1lIiwibmFtZSIsImN1c3RvbWVyX2VtYWlsIiwiZW1haWwiLCJzZWxsZXJfbmFtZSIsInNlbGxlcl9hZGRyZXNzIiwic2VsbGVyX2NvdW50cnkiLCJzZWxsZXJfZW1haWwiLCJsaW5lcyIsIm1hcCIsImxpbmUiLCJwcmljZUlkIiwicHJpY2luZyIsInByaWNlX2RldGFpbHMiLCJwcmljZSIsImN1c3RvbURlc2NyaXB0aW9uIiwiY3VzdG9tRGVzY3JpcHRpb25EZXRhaWxzIiwiZGVzY3JpcHRpb24iLCJ1bml0X3ByaWNlIiwicXVhbnRpdHkiLCJhbW91bnQiLCJkZXNjcmlwdGlvbl9kZXRhaWxzIiwicGVyaW9kIiwic3RhcnQiLCJlbmQiLCJ0ZW1wbGF0ZSIsImNvbXBpbGUiLCJodG1sIiwiYnJvd3NlciIsImxhdW5jaCIsImhlYWRsZXNzIiwiYXJncyIsInBhZ2UiLCJuZXdQYWdlIiwic2V0Q29udGVudCIsIndhaXRVbnRpbCIsInBkZkJ1ZmZlciIsInBkZiIsImZvcm1hdCIsInByaW50QmFja2dyb3VuZCIsIm1hcmdpbiIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsImNsb3NlIiwiaGVhZGVycyIsImVycm9yIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/invoice/[customerId]/pdf/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&page=%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&page=%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_invoice_customerId_pdf_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/invoice/[customerId]/pdf/route.ts */ \"(rsc)/./app/api/invoice/[customerId]/pdf/route.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_invoice_customerId_pdf_route_ts__WEBPACK_IMPORTED_MODULE_3__]);\nC_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_invoice_customerId_pdf_route_ts__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/invoice/[customerId]/pdf/route\",\n        pathname: \"/api/invoice/[customerId]/pdf\",\n        filename: \"route\",\n        bundlePath: \"app/api/invoice/[customerId]/pdf/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\DmitryKiporenko\\\\Desktop\\\\new\\\\subscriptions-UAH\\\\app\\\\api\\\\invoice\\\\[customerId]\\\\pdf\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_invoice_customerId_pdf_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZpbnZvaWNlJTJGJTVCY3VzdG9tZXJJZCU1RCUyRnBkZiUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGaW52b2ljZSUyRiU1QmN1c3RvbWVySWQlNUQlMkZwZGYlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZpbnZvaWNlJTJGJTVCY3VzdG9tZXJJZCU1RCUyRnBkZiUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEbWl0cnlLaXBvcmVua28lNUNEZXNrdG9wJTVDbmV3JTVDc3Vic2NyaXB0aW9ucy1VQUglNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0RtaXRyeUtpcG9yZW5rbyU1Q0Rlc2t0b3AlNUNuZXclNUNzdWJzY3JpcHRpb25zLVVBSCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDMkQ7QUFDeEk7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGLHFDIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxzdWJzY3JpcHRpb25zLVVBSFxcXFxhcHBcXFxcYXBpXFxcXGludm9pY2VcXFxcW2N1c3RvbWVySWRdXFxcXHBkZlxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvaW52b2ljZS9bY3VzdG9tZXJJZF0vcGRmL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvaW52b2ljZS9bY3VzdG9tZXJJZF0vcGRmXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9pbnZvaWNlL1tjdXN0b21lcklkXS9wZGYvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxEbWl0cnlLaXBvcmVua29cXFxcRGVza3RvcFxcXFxuZXdcXFxcc3Vic2NyaXB0aW9ucy1VQUhcXFxcYXBwXFxcXGFwaVxcXFxpbnZvaWNlXFxcXFtjdXN0b21lcklkXVxcXFxwZGZcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&page=%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

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

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs/promises");

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

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "puppeteer":
/*!****************************!*\
  !*** external "puppeteer" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = import("puppeteer");;

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/get-intrinsic","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/es-object-atoms","vendor-chunks/stripe","vendor-chunks/qs","vendor-chunks/object-inspect","vendor-chunks/side-channel-list","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel","vendor-chunks/call-bound","vendor-chunks/handlebars"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&page=%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvoice%2F%5BcustomerId%5D%2Fpdf%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();