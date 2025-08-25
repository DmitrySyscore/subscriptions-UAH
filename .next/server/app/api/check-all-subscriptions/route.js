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
exports.id = "app/api/check-all-subscriptions/route";
exports.ids = ["app/api/check-all-subscriptions/route"];
exports.modules = {

/***/ "(rsc)/./app/api/check-all-subscriptions/route.ts":
/*!**************************************************!*\
  !*** ./app/api/check-all-subscriptions/route.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: '2025-06-30.basil'\n});\n// SLA product IDs from create-subscription-direct/route.ts\nconst SLA_PRODUCTS = [\n    // EU products\n    'prod_Sj8nABZluozK4K',\n    'prod_Sj8njJI9kmb4di',\n    'prod_Sj8nnl3iCNdqGM',\n    // US products\n    'prod_Sj8LxTwLUfzk5t',\n    'prod_Sj8Lk6eprBEQ3k',\n    'prod_Sj8Lt4NDbZzI5i'\n];\n// Subscription and Product presentation service product IDs\nconst SUBSCRIPTION_PRODUCTS = [\n    'prod_SewWUEbVwl7dHS',\n    'prod_Sqd44yg7CGgQsY'\n];\nconst PRODUCT_PRESENTATION_SERVICE_PRODUCTS = [\n    'prod_StDZUp65e8VNOO',\n    'prod_StDKJvCffE3Nmj'\n];\nconst MARKET_AGENT_PRODUCTS = [\n    'prod_SuLPx96qTJOODr',\n    'prod_SuLPE2lEtex0fC'\n];\nfunction isValidProduct(product) {\n    return product && typeof product === 'object' && !product.deleted && 'id' in product;\n}\nasync function GET(req) {\n    const { searchParams } = new URL(req.url);\n    const userId = searchParams.get('userId');\n    if (!userId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Missing userId parameter'\n        }, {\n            status: 400\n        });\n    }\n    try {\n        // Find customer by userId (Stripe customer ID)\n        let customer;\n        try {\n            customer = await stripe.customers.retrieve(userId);\n        } catch (error) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                hasActiveSubscriptions: false,\n                message: 'No customer found with this userId'\n            });\n        }\n        if (!customer || typeof customer === 'string' || customer.deleted) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                hasActiveSubscriptions: false,\n                message: 'No customer found with this userId'\n            });\n        }\n        // Check for all active subscriptions\n        const subscriptions = await stripe.subscriptions.list({\n            customer: userId,\n            status: 'active',\n            expand: [\n                'data.items.data.price'\n            ]\n        });\n        // Collect all active subscriptions categorized by type\n        const activeSLAs = [];\n        const activeSubscriptions = [];\n        const activeProductPresentations = [];\n        const activeMarketAgents = [];\n        for (const subscription of subscriptions.data){\n            for (const item of subscription.items.data){\n                const productIdFromPrice = typeof item.price.product === 'string' ? item.price.product : item.price.product?.id;\n                if (!productIdFromPrice) continue;\n                let productName = 'Unknown';\n                try {\n                    const product = await stripe.products.retrieve(productIdFromPrice);\n                    productName = product.name || 'Unknown';\n                } catch (error) {\n                    productName = 'Unknown';\n                }\n                const subscriptionData = {\n                    subscriptionId: subscription.id,\n                    productId: productIdFromPrice,\n                    productName: productName,\n                    location: subscription.metadata?.location || subscription.metadata?.fullLocation || 'Unknown',\n                    created: subscription.created,\n                    currentPeriodStart: subscription.current_period_start,\n                    currentPeriodEnd: subscription.current_period_end\n                };\n                // Categorize by product type\n                if (SLA_PRODUCTS.includes(productIdFromPrice)) {\n                    activeSLAs.push({\n                        ...subscriptionData,\n                        slaTier: getSLATierFromProduct(productIdFromPrice)\n                    });\n                } else if (SUBSCRIPTION_PRODUCTS.includes(productIdFromPrice)) {\n                    activeSubscriptions.push({\n                        ...subscriptionData,\n                        serviceType: 'Subscription'\n                    });\n                } else if (PRODUCT_PRESENTATION_SERVICE_PRODUCTS.includes(productIdFromPrice)) {\n                    activeProductPresentations.push({\n                        ...subscriptionData,\n                        serviceType: 'Product Presentation Service'\n                    });\n                } else if (MARKET_AGENT_PRODUCTS.includes(productIdFromPrice)) {\n                    activeMarketAgents.push({\n                        ...subscriptionData,\n                        serviceType: 'Market Agent'\n                    });\n                }\n            }\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            hasActiveSubscriptions: subscriptions.data.length > 0,\n            customerId: userId,\n            activeSLAs,\n            activeSubscriptions,\n            activeProductPresentations,\n            activeMarketAgents,\n            totalActiveSubscriptions: subscriptions.data.length\n        });\n    } catch (error) {\n        console.error('Error checking all subscriptions:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to check subscription status'\n        }, {\n            status: 500\n        });\n    }\n}\nfunction getSLATierFromProduct(productId) {\n    const tierMap = {\n        'prod_Sj8nABZluozK4K': 'Bronze',\n        'prod_Sj8njJI9kmb4di': 'Silver',\n        'prod_Sj8nnl3iCNdqGM': 'Gold',\n        'prod_Sj8LxTwLUfzk5t': 'Bronze',\n        'prod_Sj8Lk6eprBEQ3k': 'Silver',\n        'prod_Sj8Lt4NDbZzI5i': 'Gold'\n    };\n    return tierMap[productId] || 'Unknown';\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NoZWNrLWFsbC1zdWJzY3JpcHRpb25zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUF3RDtBQUM1QjtBQUU1QixNQUFNRSxTQUFTLElBQUlELDhDQUFNQSxDQUFDRSxRQUFRQyxHQUFHLENBQUNDLGlCQUFpQixFQUFHO0lBQ3hEQyxZQUFZO0FBQ2Q7QUFFQSwyREFBMkQ7QUFDM0QsTUFBTUMsZUFBZTtJQUNuQixjQUFjO0lBQ2Q7SUFDQTtJQUNBO0lBQ0EsY0FBYztJQUNkO0lBQ0E7SUFDQTtDQUNEO0FBRUQsNERBQTREO0FBQzVELE1BQU1DLHdCQUF3QjtJQUM1QjtJQUNBO0NBQ0Q7QUFFRCxNQUFNQyx3Q0FBd0M7SUFDNUM7SUFDQTtDQUNEO0FBRUQsTUFBTUMsd0JBQXdCO0lBQzVCO0lBQ0E7Q0FDRDtBQUVELFNBQVNDLGVBQWVDLE9BQVk7SUFDbEMsT0FBT0EsV0FBVyxPQUFPQSxZQUFZLFlBQVksQ0FBQ0EsUUFBUUMsT0FBTyxJQUFJLFFBQVFEO0FBQy9FO0FBRU8sZUFBZUUsSUFBSUMsR0FBZ0I7SUFDeEMsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJRixJQUFJRyxHQUFHO0lBQ3hDLE1BQU1DLFNBQVNILGFBQWFJLEdBQUcsQ0FBQztJQUVoQyxJQUFJLENBQUNELFFBQVE7UUFDWCxPQUFPbkIscURBQVlBLENBQUNxQixJQUFJLENBQUM7WUFBRUMsT0FBTztRQUEyQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNoRjtJQUVBLElBQUk7UUFDRiwrQ0FBK0M7UUFDL0MsSUFBSUM7UUFDSixJQUFJO1lBQ0ZBLFdBQVcsTUFBTXRCLE9BQU91QixTQUFTLENBQUNDLFFBQVEsQ0FBQ1A7UUFDN0MsRUFBRSxPQUFPRyxPQUFPO1lBQ2QsT0FBT3RCLHFEQUFZQSxDQUFDcUIsSUFBSSxDQUFDO2dCQUN2Qk0sd0JBQXdCO2dCQUN4QkMsU0FBUztZQUNYO1FBQ0Y7UUFFQSxJQUFJLENBQUNKLFlBQVksT0FBT0Es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QjtRQUN2Qix1QkFBdUI7UUFDdkIsdUJBQXVCO1FBQ3ZCLHVCQUF1QjtRQUN2Qix1QkFBdUI7SUFDekI7SUFDQSxPQUFPQSxPQUFPLENBQUNsQixVQUFVLElBQUk7QUFDL0IiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRG1pdHJ5S2lwb3JlbmtvXFxEZXNrdG9wXFxuZXdcXHN1YnNjcmlwdGlvbnMtVUFIXFxhcHBcXGFwaVxcY2hlY2stYWxsLXN1YnNjcmlwdGlvbnNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XHJcbmltcG9ydCBTdHJpcGUgZnJvbSAnc3RyaXBlJztcclxuXHJcbmNvbnN0IHN0cmlwZSA9IG5ldyBTdHJpcGUocHJvY2Vzcy5lbnYuU1RSSVBFX1NFQ1JFVF9LRVkhLCB7XHJcbiAgYXBpVmVyc2lvbjogJzIwMjUtMDYtMzAuYmFzaWwnLFxyXG59KTtcclxuXHJcbi8vIFNMQSBwcm9kdWN0IElEcyBmcm9tIGNyZWF0ZS1zdWJzY3JpcHRpb24tZGlyZWN0L3JvdXRlLnRzXHJcbmNvbnN0IFNMQV9QUk9EVUNUUyA9IFtcclxuICAvLyBFVSBwcm9kdWN0c1xyXG4gICdwcm9kX1NqOG5BQlpsdW96SzRLJywgLy8gQnJvbnplIEVVXHJcbiAgJ3Byb2RfU2o4bmpKSTlrbWI0ZGknLCAvLyBTaWx2ZXIgRVVcclxuICAncHJvZF9TajhubmwzaUNOZHFHTScsIC8vIEdvbGQgRVVcclxuICAvLyBVUyBwcm9kdWN0c1xyXG4gICdwcm9kX1NqOEx4VHdMVWZ6azV0JywgLy8gQnJvbnplIFVTXHJcbiAgJ3Byb2RfU2o4TGs2ZXByQkVRM2snLCAvLyBTaWx2ZXIgVVNcclxuICAncHJvZF9TajhMdDRORGJaekk1aScsIC8vIEdvbGQgVVNcclxuXTtcclxuXHJcbi8vIFN1YnNjcmlwdGlvbiBhbmQgUHJvZHVjdCBwcmVzZW50YXRpb24gc2VydmljZSBwcm9kdWN0IElEc1xyXG5jb25zdCBTVUJTQ1JJUFRJT05fUFJPRFVDVFMgPSBbXHJcbiAgJ3Byb2RfU2V3V1VFYlZ3bDdkSFMnLCAvLyBFdXJvcGVfR2VybWFueVxyXG4gICdwcm9kX1NxZDQ0eWc3Q0dnUXNZJywgLy8gTm9ydGggQW1lcmljYV9VU0FcclxuXTtcclxuXHJcbmNvbnN0IFBST0RVQ1RfUFJFU0VOVEFUSU9OX1NFUlZJQ0VfUFJPRFVDVFMgPSBbXHJcbiAgJ3Byb2RfU3REWlVwNjVlOFZOT08nLCAvLyBFdXJvcGVfR2VybWFueVxyXG4gICdwcm9kX1N0REtKdkNmZkUzTm1qJywgLy8gTm9ydGggQW1lcmljYV9VU0FcclxuXTtcclxuXHJcbmNvbnN0IE1BUktFVF9BR0VOVF9QUk9EVUNUUyA9IFtcclxuICAncHJvZF9TdUxQeDk2cVRKT09EcicsIC8vIEV1cm9wZV9HZXJtYW55XHJcbiAgJ3Byb2RfU3VMUEUybEV0ZXgwZkMnLCAvLyBOb3J0aCBBbWVyaWNhX1VTQVxyXG5dO1xyXG5cclxuZnVuY3Rpb24gaXNWYWxpZFByb2R1Y3QocHJvZHVjdDogYW55KTogcHJvZHVjdCBpcyBTdHJpcGUuUHJvZHVjdCB7XHJcbiAgcmV0dXJuIHByb2R1Y3QgJiYgdHlwZW9mIHByb2R1Y3QgPT09ICdvYmplY3QnICYmICFwcm9kdWN0LmRlbGV0ZWQgJiYgJ2lkJyBpbiBwcm9kdWN0O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcTogTmV4dFJlcXVlc3QpIHtcclxuICBjb25zdCB7IHNlYXJjaFBhcmFtcyB9ID0gbmV3IFVSTChyZXEudXJsKTtcclxuICBjb25zdCB1c2VySWQgPSBzZWFyY2hQYXJhbXMuZ2V0KCd1c2VySWQnKTtcclxuXHJcbiAgaWYgKCF1c2VySWQpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTWlzc2luZyB1c2VySWQgcGFyYW1ldGVyJyB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEZpbmQgY3VzdG9tZXIgYnkgdXNlcklkIChTdHJpcGUgY3VzdG9tZXIgSUQpXHJcbiAgICBsZXQgY3VzdG9tZXI7XHJcbiAgICB0cnkge1xyXG4gICAgICBjdXN0b21lciA9IGF3YWl0IHN0cmlwZS5jdXN0b21lcnMucmV0cmlldmUodXNlcklkKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XHJcbiAgICAgICAgaGFzQWN0aXZlU3Vic2NyaXB0aW9uczogZmFsc2UsXHJcbiAgICAgICAgbWVzc2FnZTogJ05vIGN1c3RvbWVyIGZvdW5kIHdpdGggdGhpcyB1c2VySWQnLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWN1c3RvbWVyIHx8IHR5cGVvZiBjdXN0b21lciA9PT0gJ3N0cmluZycgfHwgY3VzdG9tZXIuZGVsZXRlZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgICAgIGhhc0FjdGl2ZVN1YnNjcmlwdGlvbnM6IGZhbHNlLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdObyBjdXN0b21lciBmb3VuZCB3aXRoIHRoaXMgdXNlcklkJyxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGFsbCBhY3RpdmUgc3Vic2NyaXB0aW9uc1xyXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IGF3YWl0IHN0cmlwZS5zdWJzY3JpcHRpb25zLmxpc3Qoe1xyXG4gICAgICBjdXN0b21lcjogdXNlcklkLFxyXG4gICAgICBzdGF0dXM6ICdhY3RpdmUnLFxyXG4gICAgICBleHBhbmQ6IFsnZGF0YS5pdGVtcy5kYXRhLnByaWNlJ10sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDb2xsZWN0IGFsbCBhY3RpdmUgc3Vic2NyaXB0aW9ucyBjYXRlZ29yaXplZCBieSB0eXBlXHJcbiAgICBjb25zdCBhY3RpdmVTTEFzID0gW107XHJcbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gW107XHJcbiAgICBjb25zdCBhY3RpdmVQcm9kdWN0UHJlc2VudGF0aW9ucyA9IFtdO1xyXG4gICAgY29uc3QgYWN0aXZlTWFya2V0QWdlbnRzID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2Ygc3Vic2NyaXB0aW9ucy5kYXRhKSB7XHJcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBzdWJzY3JpcHRpb24uaXRlbXMuZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IHByb2R1Y3RJZEZyb21QcmljZSA9IHR5cGVvZiBpdGVtLnByaWNlLnByb2R1Y3QgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgICA/IGl0ZW0ucHJpY2UucHJvZHVjdFxyXG4gICAgICAgICAgOiBpdGVtLnByaWNlLnByb2R1Y3Q/LmlkO1xyXG5cclxuICAgICAgICBpZiAoIXByb2R1Y3RJZEZyb21QcmljZSkgY29udGludWU7XHJcblxyXG4gICAgICAgIGxldCBwcm9kdWN0TmFtZSA9ICdVbmtub3duJztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgcHJvZHVjdCA9IGF3YWl0IHN0cmlwZS5wcm9kdWN0cy5yZXRyaWV2ZShwcm9kdWN0SWRGcm9tUHJpY2UpO1xyXG4gICAgICAgICAgcHJvZHVjdE5hbWUgPSBwcm9kdWN0Lm5hbWUgfHwgJ1Vua25vd24nO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBwcm9kdWN0TmFtZSA9ICdVbmtub3duJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbkRhdGEgPSB7XHJcbiAgICAgICAgICBzdWJzY3JpcHRpb25JZDogc3Vic2NyaXB0aW9uLmlkLFxyXG4gICAgICAgICAgcHJvZHVjdElkOiBwcm9kdWN0SWRGcm9tUHJpY2UsXHJcbiAgICAgICAgICBwcm9kdWN0TmFtZTogcHJvZHVjdE5hbWUsXHJcbiAgICAgICAgICBsb2NhdGlvbjogc3Vic2NyaXB0aW9uLm1ldGFkYXRhPy5sb2NhdGlvbiB8fCBzdWJzY3JpcHRpb24ubWV0YWRhdGE/LmZ1bGxMb2NhdGlvbiB8fCAnVW5rbm93bicsXHJcbiAgICAgICAgICBjcmVhdGVkOiBzdWJzY3JpcHRpb24uY3JlYXRlZCxcclxuICAgICAgICAgIGN1cnJlbnRQZXJpb2RTdGFydDogKHN1YnNjcmlwdGlvbiBhcyBhbnkpLmN1cnJlbnRfcGVyaW9kX3N0YXJ0LFxyXG4gICAgICAgICAgY3VycmVudFBlcmlvZEVuZDogKHN1YnNjcmlwdGlvbiBhcyBhbnkpLmN1cnJlbnRfcGVyaW9kX2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDYXRlZ29yaXplIGJ5IHByb2R1Y3QgdHlwZVxyXG4gICAgICAgIGlmIChTTEFfUFJPRFVDVFMuaW5jbHVkZXMocHJvZHVjdElkRnJvbVByaWNlKSkge1xyXG4gICAgICAgICAgYWN0aXZlU0xBcy5wdXNoKHtcclxuICAgICAgICAgICAgLi4uc3Vic2NyaXB0aW9uRGF0YSxcclxuICAgICAgICAgICAgc2xhVGllcjogZ2V0U0xBVGllckZyb21Qcm9kdWN0KHByb2R1Y3RJZEZyb21QcmljZSksXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKFNVQlNDUklQVElPTl9QUk9EVUNUUy5pbmNsdWRlcyhwcm9kdWN0SWRGcm9tUHJpY2UpKSB7XHJcbiAgICAgICAgICBhY3RpdmVTdWJzY3JpcHRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAuLi5zdWJzY3JpcHRpb25EYXRhLFxyXG4gICAgICAgICAgICBzZXJ2aWNlVHlwZTogJ1N1YnNjcmlwdGlvbicsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKFBST0RVQ1RfUFJFU0VOVEFUSU9OX1NFUlZJQ0VfUFJPRFVDVFMuaW5jbHVkZXMocHJvZHVjdElkRnJvbVByaWNlKSkge1xyXG4gICAgICAgICAgYWN0aXZlUHJvZHVjdFByZXNlbnRhdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgIC4uLnN1YnNjcmlwdGlvbkRhdGEsXHJcbiAgICAgICAgICAgIHNlcnZpY2VUeXBlOiAnUHJvZHVjdCBQcmVzZW50YXRpb24gU2VydmljZScsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKE1BUktFVF9BR0VOVF9QUk9EVUNUUy5pbmNsdWRlcyhwcm9kdWN0SWRGcm9tUHJpY2UpKSB7XHJcbiAgICAgICAgICBhY3RpdmVNYXJrZXRBZ2VudHMucHVzaCh7XHJcbiAgICAgICAgICAgIC4uLnN1YnNjcmlwdGlvbkRhdGEsXHJcbiAgICAgICAgICAgIHNlcnZpY2VUeXBlOiAnTWFya2V0IEFnZW50JyxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XHJcbiAgICAgIGhhc0FjdGl2ZVN1YnNjcmlwdGlvbnM6IHN1YnNjcmlwdGlvbnMuZGF0YS5sZW5ndGggPiAwLFxyXG4gICAgICBjdXN0b21lcklkOiB1c2VySWQsXHJcbiAgICAgIGFjdGl2ZVNMQXMsXHJcbiAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMsXHJcbiAgICAgIGFjdGl2ZVByb2R1Y3RQcmVzZW50YXRpb25zLFxyXG4gICAgICBhY3RpdmVNYXJrZXRBZ2VudHMsXHJcbiAgICAgIHRvdGFsQWN0aXZlU3Vic2NyaXB0aW9uczogc3Vic2NyaXB0aW9ucy5kYXRhLmxlbmd0aCxcclxuICAgIH0pO1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgYWxsIHN1YnNjcmlwdGlvbnM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gY2hlY2sgc3Vic2NyaXB0aW9uIHN0YXR1cycgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNMQVRpZXJGcm9tUHJvZHVjdChwcm9kdWN0SWQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgdGllck1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICdwcm9kX1NqOG5BQlpsdW96SzRLJzogJ0Jyb256ZScsXHJcbiAgICAncHJvZF9TajhuakpJOWttYjRkaSc6ICdTaWx2ZXInLFxyXG4gICAgJ3Byb2RfU2o4bm5sM2lDTmRxR00nOiAnR29sZCcsXHJcbiAgICAncHJvZF9TajhMeFR3TFVmems1dCc6ICdCcm9uemUnLFxyXG4gICAgJ3Byb2RfU2o4TGs2ZXByQkVRM2snOiAnU2lsdmVyJyxcclxuICAgICdwcm9kX1NqOEx0NE5EYlp6STVpJzogJ0dvbGQnLFxyXG4gIH07XHJcbiAgcmV0dXJuIHRpZXJNYXBbcHJvZHVjdElkXSB8fCAnVW5rbm93bic7XHJcbn0iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiU3RyaXBlIiwic3RyaXBlIiwicHJvY2VzcyIsImVudiIsIlNUUklQRV9TRUNSRVRfS0VZIiwiYXBpVmVyc2lvbiIsIlNMQV9QUk9EVUNUUyIsIlNVQlNDUklQVElPTl9QUk9EVUNUUyIsIlBST0RVQ1RfUFJFU0VOVEFUSU9OX1NFUlZJQ0VfUFJPRFVDVFMiLCJNQVJLRVRfQUdFTlRfUFJPRFVDVFMiLCJpc1ZhbGlkUHJvZHVjdCIsInByb2R1Y3QiLCJkZWxldGVkIiwiR0VUIiwicmVxIiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwidXNlcklkIiwiZ2V0IiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiY3VzdG9tZXIiLCJjdXN0b21lcnMiLCJyZXRyaWV2ZSIsImhhc0FjdGl2ZVN1YnNjcmlwdGlvbnMiLCJtZXNzYWdlIiwic3Vic2NyaXB0aW9ucyIsImxpc3QiLCJleHBhbmQiLCJhY3RpdmVTTEFzIiwiYWN0aXZlU3Vic2NyaXB0aW9ucyIsImFjdGl2ZVByb2R1Y3RQcmVzZW50YXRpb25zIiwiYWN0aXZlTWFya2V0QWdlbnRzIiwic3Vic2NyaXB0aW9uIiwiZGF0YSIsIml0ZW0iLCJpdGVtcyIsInByb2R1Y3RJZEZyb21QcmljZSIsInByaWNlIiwiaWQiLCJwcm9kdWN0TmFtZSIsInByb2R1Y3RzIiwibmFtZSIsInN1YnNjcmlwdGlvbkRhdGEiLCJzdWJzY3JpcHRpb25JZCIsInByb2R1Y3RJZCIsImxvY2F0aW9uIiwibWV0YWRhdGEiLCJmdWxsTG9jYXRpb24iLCJjcmVhdGVkIiwiY3VycmVudFBlcmlvZFN0YXJ0IiwiY3VycmVudF9wZXJpb2Rfc3RhcnQiLCJjdXJyZW50UGVyaW9kRW5kIiwiY3VycmVudF9wZXJpb2RfZW5kIiwiaW5jbHVkZXMiLCJwdXNoIiwic2xhVGllciIsImdldFNMQVRpZXJGcm9tUHJvZHVjdCIsInNlcnZpY2VUeXBlIiwibGVuZ3RoIiwiY3VzdG9tZXJJZCIsInRvdGFsQWN0aXZlU3Vic2NyaXB0aW9ucyIsImNvbnNvbGUiLCJ0aWVyTWFwIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/check-all-subscriptions/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_check_all_subscriptions_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/check-all-subscriptions/route.ts */ \"(rsc)/./app/api/check-all-subscriptions/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/check-all-subscriptions/route\",\n        pathname: \"/api/check-all-subscriptions\",\n        filename: \"route\",\n        bundlePath: \"app/api/check-all-subscriptions/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\DmitryKiporenko\\\\Desktop\\\\new\\\\subscriptions-UAH\\\\app\\\\api\\\\check-all-subscriptions\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_check_all_subscriptions_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjaGVjay1hbGwtc3Vic2NyaXB0aW9ucyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY2hlY2stYWxsLXN1YnNjcmlwdGlvbnMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjaGVjay1hbGwtc3Vic2NyaXB0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEbWl0cnlLaXBvcmVua28lNUNEZXNrdG9wJTVDbmV3JTVDc3Vic2NyaXB0aW9ucy1VQUglNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0RtaXRyeUtpcG9yZW5rbyU1Q0Rlc2t0b3AlNUNuZXclNUNzdWJzY3JpcHRpb25zLVVBSCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDd0Q7QUFDckk7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxzdWJzY3JpcHRpb25zLVVBSFxcXFxhcHBcXFxcYXBpXFxcXGNoZWNrLWFsbC1zdWJzY3JpcHRpb25zXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jaGVjay1hbGwtc3Vic2NyaXB0aW9ucy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NoZWNrLWFsbC1zdWJzY3JpcHRpb25zXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jaGVjay1hbGwtc3Vic2NyaXB0aW9ucy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxzdWJzY3JpcHRpb25zLVVBSFxcXFxhcHBcXFxcYXBpXFxcXGNoZWNrLWFsbC1zdWJzY3JpcHRpb25zXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/stripe","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/qs","vendor-chunks/call-bind-apply-helpers","vendor-chunks/get-proto","vendor-chunks/object-inspect","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/hasown","vendor-chunks/get-intrinsic","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/call-bound"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();