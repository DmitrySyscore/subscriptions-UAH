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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: '2025-06-30.basil'\n});\n// SLA product IDs from create-subscription-direct/route.ts\nconst SLA_PRODUCTS = [\n    // EU products\n    'prod_Sj8nABZluozK4K',\n    'prod_Sj8njJI9kmb4di',\n    'prod_Sj8nnl3iCNdqGM',\n    // US products\n    'prod_Sj8LxTwLUfzk5t',\n    'prod_Sj8Lk6eprBEQ3k',\n    'prod_Sj8Lt4NDbZzI5i'\n];\n// Subscription and Product presentation service product IDs\nconst SUBSCRIPTION_PRODUCTS = [\n    'prod_SewWUEbVwl7dHS',\n    'prod_Sqd44yg7CGgQsY'\n];\nconst PRODUCT_PRESENTATION_SERVICE_PRODUCTS = [\n    'prod_StDZUp65e8VNOO',\n    'prod_StDKJvCffE3Nmj'\n];\nconst MARKET_AGENT_PRODUCTS = [\n    'prod_SuLPx96qTJOODr',\n    'prod_SuLPE2lEtex0fC'\n];\nfunction isValidProduct(product) {\n    return product && typeof product === 'object' && !product.deleted && 'id' in product;\n}\nasync function GET(req) {\n    const { searchParams } = new URL(req.url);\n    const userId = searchParams.get('userId');\n    if (!userId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Missing userId parameter'\n        }, {\n            status: 400\n        });\n    }\n    try {\n        // Find customer by userId (Stripe customer ID)\n        let customer;\n        try {\n            customer = await stripe.customers.retrieve(userId);\n        } catch (error) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                hasActiveSubscriptions: false,\n                message: 'No customer found with this userId'\n            });\n        }\n        if (!customer || typeof customer === 'string' || customer.deleted) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                hasActiveSubscriptions: false,\n                message: 'No customer found with this userId'\n            });\n        }\n        // Check for all active subscriptions\n        const subscriptions = await stripe.subscriptions.list({\n            customer: userId,\n            status: 'active',\n            expand: [\n                'data.items.data.price'\n            ]\n        });\n        // Collect all active subscriptions categorized by type\n        const activeSLAs = [];\n        const activeSubscriptions = [];\n        const activeProductPresentations = [];\n        const activeMarketAgents = [];\n        for (const subscription of subscriptions.data){\n            for (const item of subscription.items.data){\n                const productIdFromPrice = typeof item.price.product === 'string' ? item.price.product : item.price.product?.id;\n                if (!productIdFromPrice) continue;\n                let productName = 'Unknown';\n                try {\n                    const product = await stripe.products.retrieve(productIdFromPrice);\n                    productName = product.name || 'Unknown';\n                } catch (error) {\n                    productName = 'Unknown';\n                }\n                const subscriptionData = {\n                    subscriptionId: subscription.id,\n                    productId: productIdFromPrice,\n                    productName: productName,\n                    location: subscription.metadata?.location || subscription.metadata?.fullLocation || 'Unknown',\n                    created: subscription.created,\n                    currentPeriodStart: subscription.current_period_start,\n                    currentPeriodEnd: subscription.current_period_end\n                };\n                // Categorize by product type\n                if (SLA_PRODUCTS.includes(productIdFromPrice)) {\n                    activeSLAs.push({\n                        ...subscriptionData,\n                        slaTier: getSLATierFromProduct(productIdFromPrice)\n                    });\n                } else if (SUBSCRIPTION_PRODUCTS.includes(productIdFromPrice)) {\n                    activeSubscriptions.push({\n                        ...subscriptionData,\n                        serviceType: 'Subscription'\n                    });\n                } else if (PRODUCT_PRESENTATION_SERVICE_PRODUCTS.includes(productIdFromPrice)) {\n                    activeProductPresentations.push({\n                        ...subscriptionData,\n                        serviceType: 'Product Presentation Service'\n                    });\n                } else if (MARKET_AGENT_PRODUCTS.includes(productIdFromPrice)) {\n                    activeMarketAgents.push({\n                        ...subscriptionData,\n                        serviceType: 'Market Agent'\n                    });\n                }\n            }\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            hasActiveSubscriptions: subscriptions.data.length > 0,\n            customerId: userId,\n            activeSLAs,\n            activeSubscriptions,\n            activeProductPresentations,\n            activeMarketAgents,\n            totalActiveSubscriptions: subscriptions.data.length\n        });\n    } catch (error) {\n        console.error('Error checking all subscriptions:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to check subscription status'\n        }, {\n            status: 500\n        });\n    }\n}\nfunction getSLATierFromProduct(productId) {\n    const tierMap = {\n        'prod_Sj8nABZluozK4K': 'Bronze',\n        'prod_Sj8njJI9kmb4di': 'Silver',\n        'prod_Sj8nnl3iCNdqGM': 'Gold',\n        'prod_Sj8LxTwLUfzk5t': 'Bronze',\n        'prod_Sj8Lk6eprBEQ3k': 'Silver',\n        'prod_Sj8Lt4NDbZzI5i': 'Gold'\n    };\n    return tierMap[productId] || 'Unknown';\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NoZWNrLWFsbC1zdWJzY3JpcHRpb25zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUF3RDtBQUM1QjtBQUU1QixNQUFNRSxTQUFTLElBQUlELDhDQUFNQSxDQUFDRSxRQUFRQyxHQUFHLENBQUNDLGlCQUFpQixFQUFHO0lBQ3hEQyxZQUFZO0FBQ2Q7QUFFQSwyREFBMkQ7QUFDM0QsTUFBTUMsZUFBZTtJQUNuQixjQUFjO0lBQ2Q7SUFDQTtJQUNBO0lBQ0EsY0FBYztJQUNkO0lBQ0E7SUFDQTtDQUNEO0FBRUQsNERBQTREO0FBQzVELE1BQU1DLHdCQUF3QjtJQUM1QjtJQUNBO0NBQ0Q7QUFFRCxNQUFNQyx3Q0FBd0M7SUFDNUM7SUFDQTtDQUNEO0FBRUQsTUFBTUMsd0JBQXdCO0lBQzVCO0lBQ0E7Q0FDRDtBQUVELFNBQVNDLGVBQWVDLE9BQVk7SUFDbEMsT0FBT0EsV0FBVyxPQUFPQSxZQUFZLFlBQVksQ0FBQ0EsUUFBUUMsT0FBTyxJQUFJLFFBQVFEO0FBQy9FO0FBRU8sZUFBZUUsSUFBSUMsR0FBZ0I7SUFDeEMsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJRixJQUFJRyxHQUFHO0lBQ3hDLE1BQU1DLFNBQVNILGFBQWFJLEdBQUcsQ0FBQztJQUVoQyxJQUFJLENBQUNELFFBQVE7UUFDWCxPQUFPbkIscURBQVlBLENBQUNxQixJQUFJLENBQUM7WUFBRUMsT0FBTztRQUEyQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNoRjtJQUVBLElBQUk7UUFDRiwrQ0FBK0M7UUFDL0MsSUFBSUM7UUFDSixJQUFJO1lBQ0ZBLFdBQVcsTUFBTXRCLE9BQU91QixTQUFTLENBQUNDLFFBQVEsQ0FBQ1A7UUFDN0MsRUFBRSxPQUFPRyxPQUFPO1lBQ2QsT0FBT3RCLHFEQUFZQSxDQUFDcUIsSUFBSSxDQUFDO2dCQUN2Qk0sd0JBQXdCO2dCQUN4QkMsU0FBUztZQUNYO1FBQ0Y7UUFFQSxJQUFJLENBQUNKLFlBQVksT0FBT0Es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QjtRQUN2Qix1QkFBdUI7UUFDdkIsdUJBQXVCO1FBQ3ZCLHVCQUF1QjtRQUN2Qix1QkFBdUI7SUFDekI7SUFDQSxPQUFPQSxPQUFPLENBQUNsQixVQUFVLElBQUk7QUFDL0IiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRG1pdHJ5S2lwb3JlbmtvXFxEZXNrdG9wXFxuZXdcXGZvbGRlclxcc3Vic2NyaXB0aW9ucy1VQUhcXGFwcFxcYXBpXFxjaGVjay1hbGwtc3Vic2NyaXB0aW9uc1xccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcclxuaW1wb3J0IFN0cmlwZSBmcm9tICdzdHJpcGUnO1xyXG5cclxuY29uc3Qgc3RyaXBlID0gbmV3IFN0cmlwZShwcm9jZXNzLmVudi5TVFJJUEVfU0VDUkVUX0tFWSEsIHtcclxuICBhcGlWZXJzaW9uOiAnMjAyNS0wNi0zMC5iYXNpbCcsXHJcbn0pO1xyXG5cclxuLy8gU0xBIHByb2R1Y3QgSURzIGZyb20gY3JlYXRlLXN1YnNjcmlwdGlvbi1kaXJlY3Qvcm91dGUudHNcclxuY29uc3QgU0xBX1BST0RVQ1RTID0gW1xyXG4gIC8vIEVVIHByb2R1Y3RzXHJcbiAgJ3Byb2RfU2o4bkFCWmx1b3pLNEsnLCAvLyBCcm9uemUgRVVcclxuICAncHJvZF9TajhuakpJOWttYjRkaScsIC8vIFNpbHZlciBFVVxyXG4gICdwcm9kX1NqOG5ubDNpQ05kcUdNJywgLy8gR29sZCBFVVxyXG4gIC8vIFVTIHByb2R1Y3RzXHJcbiAgJ3Byb2RfU2o4THhUd0xVZnprNXQnLCAvLyBCcm9uemUgVVNcclxuICAncHJvZF9TajhMazZlcHJCRVEzaycsIC8vIFNpbHZlciBVU1xyXG4gICdwcm9kX1NqOEx0NE5EYlp6STVpJywgLy8gR29sZCBVU1xyXG5dO1xyXG5cclxuLy8gU3Vic2NyaXB0aW9uIGFuZCBQcm9kdWN0IHByZXNlbnRhdGlvbiBzZXJ2aWNlIHByb2R1Y3QgSURzXHJcbmNvbnN0IFNVQlNDUklQVElPTl9QUk9EVUNUUyA9IFtcclxuICAncHJvZF9TZXdXVUViVndsN2RIUycsIC8vIEV1cm9wZV9HZXJtYW55XHJcbiAgJ3Byb2RfU3FkNDR5ZzdDR2dRc1knLCAvLyBOb3J0aCBBbWVyaWNhX1VTQVxyXG5dO1xyXG5cclxuY29uc3QgUFJPRFVDVF9QUkVTRU5UQVRJT05fU0VSVklDRV9QUk9EVUNUUyA9IFtcclxuICAncHJvZF9TdERaVXA2NWU4Vk5PTycsIC8vIEV1cm9wZV9HZXJtYW55XHJcbiAgJ3Byb2RfU3RES0p2Q2ZmRTNObWonLCAvLyBOb3J0aCBBbWVyaWNhX1VTQVxyXG5dO1xyXG5cclxuY29uc3QgTUFSS0VUX0FHRU5UX1BST0RVQ1RTID0gW1xyXG4gICdwcm9kX1N1TFB4OTZxVEpPT0RyJywgLy8gRXVyb3BlX0dlcm1hbnlcclxuICAncHJvZF9TdUxQRTJsRXRleDBmQycsIC8vIE5vcnRoIEFtZXJpY2FfVVNBXHJcbl07XHJcblxyXG5mdW5jdGlvbiBpc1ZhbGlkUHJvZHVjdChwcm9kdWN0OiBhbnkpOiBwcm9kdWN0IGlzIFN0cmlwZS5Qcm9kdWN0IHtcclxuICByZXR1cm4gcHJvZHVjdCAmJiB0eXBlb2YgcHJvZHVjdCA9PT0gJ29iamVjdCcgJiYgIXByb2R1Y3QuZGVsZXRlZCAmJiAnaWQnIGluIHByb2R1Y3Q7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxOiBOZXh0UmVxdWVzdCkge1xyXG4gIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xyXG4gIGNvbnN0IHVzZXJJZCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3VzZXJJZCcpO1xyXG5cclxuICBpZiAoIXVzZXJJZCkge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdNaXNzaW5nIHVzZXJJZCBwYXJhbWV0ZXInIH0sIHsgc3RhdHVzOiA0MDAgfSk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gRmluZCBjdXN0b21lciBieSB1c2VySWQgKFN0cmlwZSBjdXN0b21lciBJRClcclxuICAgIGxldCBjdXN0b21lcjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGN1c3RvbWVyID0gYXdhaXQgc3RyaXBlLmN1c3RvbWVycy5yZXRyaWV2ZSh1c2VySWQpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgICBoYXNBY3RpdmVTdWJzY3JpcHRpb25zOiBmYWxzZSxcclxuICAgICAgICBtZXNzYWdlOiAnTm8gY3VzdG9tZXIgZm91bmQgd2l0aCB0aGlzIHVzZXJJZCcsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghY3VzdG9tZXIgfHwgdHlwZW9mIGN1c3RvbWVyID09PSAnc3RyaW5nJyB8fCBjdXN0b21lci5kZWxldGVkKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XHJcbiAgICAgICAgaGFzQWN0aXZlU3Vic2NyaXB0aW9uczogZmFsc2UsXHJcbiAgICAgICAgbWVzc2FnZTogJ05vIGN1c3RvbWVyIGZvdW5kIHdpdGggdGhpcyB1c2VySWQnLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgYWxsIGFjdGl2ZSBzdWJzY3JpcHRpb25zXHJcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gYXdhaXQgc3RyaXBlLnN1YnNjcmlwdGlvbnMubGlzdCh7XHJcbiAgICAgIGN1c3RvbWVyOiB1c2VySWQsXHJcbiAgICAgIHN0YXR1czogJ2FjdGl2ZScsXHJcbiAgICAgIGV4cGFuZDogWydkYXRhLml0ZW1zLmRhdGEucHJpY2UnXSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENvbGxlY3QgYWxsIGFjdGl2ZSBzdWJzY3JpcHRpb25zIGNhdGVnb3JpemVkIGJ5IHR5cGVcclxuICAgIGNvbnN0IGFjdGl2ZVNMQXMgPSBbXTtcclxuICAgIGNvbnN0IGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSBbXTtcclxuICAgIGNvbnN0IGFjdGl2ZVByb2R1Y3RQcmVzZW50YXRpb25zID0gW107XHJcbiAgICBjb25zdCBhY3RpdmVNYXJrZXRBZ2VudHMgPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IHN1YnNjcmlwdGlvbiBvZiBzdWJzY3JpcHRpb25zLmRhdGEpIHtcclxuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHN1YnNjcmlwdGlvbi5pdGVtcy5kYXRhKSB7XHJcbiAgICAgICAgY29uc3QgcHJvZHVjdElkRnJvbVByaWNlID0gdHlwZW9mIGl0ZW0ucHJpY2UucHJvZHVjdCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgID8gaXRlbS5wcmljZS5wcm9kdWN0XHJcbiAgICAgICAgICA6IGl0ZW0ucHJpY2UucHJvZHVjdD8uaWQ7XHJcblxyXG4gICAgICAgIGlmICghcHJvZHVjdElkRnJvbVByaWNlKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgbGV0IHByb2R1Y3ROYW1lID0gJ1Vua25vd24nO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBwcm9kdWN0ID0gYXdhaXQgc3RyaXBlLnByb2R1Y3RzLnJldHJpZXZlKHByb2R1Y3RJZEZyb21QcmljZSk7XHJcbiAgICAgICAgICBwcm9kdWN0TmFtZSA9IHByb2R1Y3QubmFtZSB8fCAnVW5rbm93bic7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIHByb2R1Y3ROYW1lID0gJ1Vua25vd24nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uRGF0YSA9IHtcclxuICAgICAgICAgIHN1YnNjcmlwdGlvbklkOiBzdWJzY3JpcHRpb24uaWQsXHJcbiAgICAgICAgICBwcm9kdWN0SWQ6IHByb2R1Y3RJZEZyb21QcmljZSxcclxuICAgICAgICAgIHByb2R1Y3ROYW1lOiBwcm9kdWN0TmFtZSxcclxuICAgICAgICAgIGxvY2F0aW9uOiBzdWJzY3JpcHRpb24ubWV0YWRhdGE/LmxvY2F0aW9uIHx8IHN1YnNjcmlwdGlvbi5tZXRhZGF0YT8uZnVsbExvY2F0aW9uIHx8ICdVbmtub3duJyxcclxuICAgICAgICAgIGNyZWF0ZWQ6IHN1YnNjcmlwdGlvbi5jcmVhdGVkLFxyXG4gICAgICAgICAgY3VycmVudFBlcmlvZFN0YXJ0OiAoc3Vic2NyaXB0aW9uIGFzIGFueSkuY3VycmVudF9wZXJpb2Rfc3RhcnQsXHJcbiAgICAgICAgICBjdXJyZW50UGVyaW9kRW5kOiAoc3Vic2NyaXB0aW9uIGFzIGFueSkuY3VycmVudF9wZXJpb2RfZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENhdGVnb3JpemUgYnkgcHJvZHVjdCB0eXBlXHJcbiAgICAgICAgaWYgKFNMQV9QUk9EVUNUUy5pbmNsdWRlcyhwcm9kdWN0SWRGcm9tUHJpY2UpKSB7XHJcbiAgICAgICAgICBhY3RpdmVTTEFzLnB1c2goe1xyXG4gICAgICAgICAgICAuLi5zdWJzY3JpcHRpb25EYXRhLFxyXG4gICAgICAgICAgICBzbGFUaWVyOiBnZXRTTEFUaWVyRnJvbVByb2R1Y3QocHJvZHVjdElkRnJvbVByaWNlKSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoU1VCU0NSSVBUSU9OX1BST0RVQ1RTLmluY2x1ZGVzKHByb2R1Y3RJZEZyb21QcmljZSkpIHtcclxuICAgICAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgIC4uLnN1YnNjcmlwdGlvbkRhdGEsXHJcbiAgICAgICAgICAgIHNlcnZpY2VUeXBlOiAnU3Vic2NyaXB0aW9uJyxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoUFJPRFVDVF9QUkVTRU5UQVRJT05fU0VSVklDRV9QUk9EVUNUUy5pbmNsdWRlcyhwcm9kdWN0SWRGcm9tUHJpY2UpKSB7XHJcbiAgICAgICAgICBhY3RpdmVQcm9kdWN0UHJlc2VudGF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgLi4uc3Vic2NyaXB0aW9uRGF0YSxcclxuICAgICAgICAgICAgc2VydmljZVR5cGU6ICdQcm9kdWN0IFByZXNlbnRhdGlvbiBTZXJ2aWNlJyxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTUFSS0VUX0FHRU5UX1BST0RVQ1RTLmluY2x1ZGVzKHByb2R1Y3RJZEZyb21QcmljZSkpIHtcclxuICAgICAgICAgIGFjdGl2ZU1hcmtldEFnZW50cy5wdXNoKHtcclxuICAgICAgICAgICAgLi4uc3Vic2NyaXB0aW9uRGF0YSxcclxuICAgICAgICAgICAgc2VydmljZVR5cGU6ICdNYXJrZXQgQWdlbnQnLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgaGFzQWN0aXZlU3Vic2NyaXB0aW9uczogc3Vic2NyaXB0aW9ucy5kYXRhLmxlbmd0aCA+IDAsXHJcbiAgICAgIGN1c3RvbWVySWQ6IHVzZXJJZCxcclxuICAgICAgYWN0aXZlU0xBcyxcclxuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucyxcclxuICAgICAgYWN0aXZlUHJvZHVjdFByZXNlbnRhdGlvbnMsXHJcbiAgICAgIGFjdGl2ZU1hcmtldEFnZW50cyxcclxuICAgICAgdG90YWxBY3RpdmVTdWJzY3JpcHRpb25zOiBzdWJzY3JpcHRpb25zLmRhdGEubGVuZ3RoLFxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjaGVja2luZyBhbGwgc3Vic2NyaXB0aW9uczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjaGVjayBzdWJzY3JpcHRpb24gc3RhdHVzJyB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U0xBVGllckZyb21Qcm9kdWN0KHByb2R1Y3RJZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCB0aWVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgJ3Byb2RfU2o4bkFCWmx1b3pLNEsnOiAnQnJvbnplJyxcclxuICAgICdwcm9kX1NqOG5qSkk5a21iNGRpJzogJ1NpbHZlcicsXHJcbiAgICAncHJvZF9TajhubmwzaUNOZHFHTSc6ICdHb2xkJyxcclxuICAgICdwcm9kX1NqOEx4VHdMVWZ6azV0JzogJ0Jyb256ZScsXHJcbiAgICAncHJvZF9TajhMazZlcHJCRVEzayc6ICdTaWx2ZXInLFxyXG4gICAgJ3Byb2RfU2o4THQ0TkRiWnpJNWknOiAnR29sZCcsXHJcbiAgfTtcclxuICByZXR1cm4gdGllck1hcFtwcm9kdWN0SWRdIHx8ICdVbmtub3duJztcclxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJTdHJpcGUiLCJzdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVF9LRVkiLCJhcGlWZXJzaW9uIiwiU0xBX1BST0RVQ1RTIiwiU1VCU0NSSVBUSU9OX1BST0RVQ1RTIiwiUFJPRFVDVF9QUkVTRU5UQVRJT05fU0VSVklDRV9QUk9EVUNUUyIsIk1BUktFVF9BR0VOVF9QUk9EVUNUUyIsImlzVmFsaWRQcm9kdWN0IiwicHJvZHVjdCIsImRlbGV0ZWQiLCJHRVQiLCJyZXEiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJ1c2VySWQiLCJnZXQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJjdXN0b21lciIsImN1c3RvbWVycyIsInJldHJpZXZlIiwiaGFzQWN0aXZlU3Vic2NyaXB0aW9ucyIsIm1lc3NhZ2UiLCJzdWJzY3JpcHRpb25zIiwibGlzdCIsImV4cGFuZCIsImFjdGl2ZVNMQXMiLCJhY3RpdmVTdWJzY3JpcHRpb25zIiwiYWN0aXZlUHJvZHVjdFByZXNlbnRhdGlvbnMiLCJhY3RpdmVNYXJrZXRBZ2VudHMiLCJzdWJzY3JpcHRpb24iLCJkYXRhIiwiaXRlbSIsIml0ZW1zIiwicHJvZHVjdElkRnJvbVByaWNlIiwicHJpY2UiLCJpZCIsInByb2R1Y3ROYW1lIiwicHJvZHVjdHMiLCJuYW1lIiwic3Vic2NyaXB0aW9uRGF0YSIsInN1YnNjcmlwdGlvbklkIiwicHJvZHVjdElkIiwibG9jYXRpb24iLCJtZXRhZGF0YSIsImZ1bGxMb2NhdGlvbiIsImNyZWF0ZWQiLCJjdXJyZW50UGVyaW9kU3RhcnQiLCJjdXJyZW50X3BlcmlvZF9zdGFydCIsImN1cnJlbnRQZXJpb2RFbmQiLCJjdXJyZW50X3BlcmlvZF9lbmQiLCJpbmNsdWRlcyIsInB1c2giLCJzbGFUaWVyIiwiZ2V0U0xBVGllckZyb21Qcm9kdWN0Iiwic2VydmljZVR5cGUiLCJsZW5ndGgiLCJjdXN0b21lcklkIiwidG90YWxBY3RpdmVTdWJzY3JpcHRpb25zIiwiY29uc29sZSIsInRpZXJNYXAiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/check-all-subscriptions/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_DmitryKiporenko_Desktop_new_folder_subscriptions_UAH_app_api_check_all_subscriptions_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/check-all-subscriptions/route.ts */ \"(rsc)/./app/api/check-all-subscriptions/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/check-all-subscriptions/route\",\n        pathname: \"/api/check-all-subscriptions\",\n        filename: \"route\",\n        bundlePath: \"app/api/check-all-subscriptions/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\DmitryKiporenko\\\\Desktop\\\\new\\\\folder\\\\subscriptions-UAH\\\\app\\\\api\\\\check-all-subscriptions\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_DmitryKiporenko_Desktop_new_folder_subscriptions_UAH_app_api_check_all_subscriptions_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjaGVjay1hbGwtc3Vic2NyaXB0aW9ucyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY2hlY2stYWxsLXN1YnNjcmlwdGlvbnMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjaGVjay1hbGwtc3Vic2NyaXB0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEbWl0cnlLaXBvcmVua28lNUNEZXNrdG9wJTVDbmV3JTVDZm9sZGVyJTVDc3Vic2NyaXB0aW9ucy1VQUglNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0RtaXRyeUtpcG9yZW5rbyU1Q0Rlc2t0b3AlNUNuZXclNUNmb2xkZXIlNUNzdWJzY3JpcHRpb25zLVVBSCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDZ0U7QUFDN0k7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxmb2xkZXJcXFxcc3Vic2NyaXB0aW9ucy1VQUhcXFxcYXBwXFxcXGFwaVxcXFxjaGVjay1hbGwtc3Vic2NyaXB0aW9uc1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvY2hlY2stYWxsLXN1YnNjcmlwdGlvbnMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jaGVjay1hbGwtc3Vic2NyaXB0aW9uc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvY2hlY2stYWxsLXN1YnNjcmlwdGlvbnMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxEbWl0cnlLaXBvcmVua29cXFxcRGVza3RvcFxcXFxuZXdcXFxcZm9sZGVyXFxcXHN1YnNjcmlwdGlvbnMtVUFIXFxcXGFwcFxcXFxhcGlcXFxcY2hlY2stYWxsLXN1YnNjcmlwdGlvbnNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/stripe","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/qs","vendor-chunks/call-bind-apply-helpers","vendor-chunks/get-proto","vendor-chunks/object-inspect","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/hasown","vendor-chunks/get-intrinsic","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/call-bound"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-all-subscriptions%2Froute&page=%2Fapi%2Fcheck-all-subscriptions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-all-subscriptions%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Cfolder%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();