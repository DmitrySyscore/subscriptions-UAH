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
exports.id = "app/api/create-subscription-direct/route";
exports.ids = ["app/api/create-subscription-direct/route"];
exports.modules = {

/***/ "(rsc)/./app/api/create-subscription-direct/route.ts":
/*!*****************************************************!*\
  !*** ./app/api/create-subscription-direct/route.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_0__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: '2025-06-30.basil'\n});\nasync function POST(req) {\n    const { ref, location, productType, slaTier, includeSubscription, customerId, paymentMethodId } = await req.json();\n    console.log('create-subscription-direct received:', {\n        ref,\n        location,\n        productType,\n        slaTier,\n        includeSubscription,\n        customerId,\n        paymentMethodId\n    });\n    if (!customerId || !paymentMethodId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: 'Customer ID and Payment Method ID are required'\n        }, {\n            status: 400\n        });\n    }\n    try {\n        const lineItems = [];\n        // Add subscription if selected\n        if (includeSubscription) {\n            lineItems.push({\n                price: 'price_1RTdrCRj81djxho2lPgusn15',\n                quantity: 1\n            });\n        }\n        // Add SLA product if selected\n        if ((productType === 'SLA' || productType === 'Both') && slaTier && location) {\n            const productIdMap = {\n                EU: {\n                    Bronze: 'prod_Sj8nABZluozK4K',\n                    Silver: 'prod_Sj8njJI9kmb4di',\n                    Gold: 'prod_Sj8nnl3iCNdqGM'\n                },\n                US: {\n                    Bronze: 'prod_Sj8LxTwLUfzk5t',\n                    Silver: 'prod_Sj8Lk6eprBEQ3k',\n                    Gold: 'prod_Sj8Lt4NDbZzI5i'\n                }\n            };\n            const productId = productIdMap[location]?.[slaTier];\n            if (productId) {\n                const prices = await stripe.prices.list({\n                    product: productId,\n                    active: true\n                });\n                if (prices.data.length > 0) {\n                    lineItems.push({\n                        price: prices.data[0].id,\n                        quantity: 1\n                    });\n                } else {\n                    console.error(`Price not found for product: ${productId}`);\n                }\n            } else {\n                console.error(`Product ID not found for location: ${location}, tier: ${slaTier}`);\n            }\n        }\n        if (lineItems.length === 0) {\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                error: 'No products selected'\n            }, {\n                status: 400\n            });\n        }\n        // Create subscription directly using saved payment method\n        const subscription = await stripe.subscriptions.create({\n            customer: customerId,\n            items: lineItems,\n            default_payment_method: paymentMethodId,\n            metadata: {\n                ...ref && {\n                    referralCode: ref\n                },\n                ...location && {\n                    location\n                },\n                ...productType && {\n                    productType\n                },\n                ...slaTier && {\n                    slaTier\n                }\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            success: true,\n            subscriptionId: subscription.id,\n            status: subscription.status\n        });\n    } catch (error) {\n        console.error('Error creating subscription:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: 'Failed to create subscription'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NyZWF0ZS1zdWJzY3JpcHRpb24tZGlyZWN0L3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE0QjtBQUNlO0FBRTNDLE1BQU1FLFNBQVMsSUFBSUYsOENBQU1BLENBQUNHLFFBQVFDLEdBQUcsQ0FBQ0MsaUJBQWlCLEVBQUc7SUFDeERDLFlBQVk7QUFDZDtBQUVPLGVBQWVDLEtBQUtDLEdBQVk7SUFDckMsTUFBTSxFQUNKQyxHQUFHLEVBQ0hDLFFBQVEsRUFDUkMsV0FBVyxFQUNYQyxPQUFPLEVBQ1BDLG1CQUFtQixFQUNuQkMsVUFBVSxFQUNWQyxlQUFlLEVBQ2hCLEdBQUcsTUFBTVAsSUFBSVEsSUFBSTtJQUVsQkMsUUFBUUMsR0FBRyxDQUFDLHdDQUF3QztRQUNsRFQ7UUFDQUM7UUFDQUM7UUFDQUM7UUFDQUM7UUFDQUM7UUFDQUM7SUFDRjtJQUVBLElBQUksQ0FBQ0QsY0FBYyxDQUFDQyxpQkFBaUI7UUFDbkMsT0FBT2QscURBQVlBLENBQUNlLElBQUksQ0FDdEI7WUFBRUcsT0FBTztRQUFpRCxHQUMxRDtZQUFFQyxRQUFRO1FBQUk7SUFFbEI7SUFFQSxJQUFJO1FBQ0YsTUFBTUMsWUFBbUIsRUFBRTtRQUUzQiwrQkFBK0I7UUFDL0IsSUFBSVIscUJBQXFCO1lBQ3ZCUSxVQUFVQyxJQUFJLENBQUM7Z0JBQ2JDLE9BQU87Z0JBQ1BDLFVBQVU7WUFDWjtRQUNGO1FBRUEsOEJBQThCO1FBQzlCLElBQUksQ0FBQ2IsZ0JBQWdCLFNBQVNBLGdCQUFnQixNQUFLLEtBQU1DLFdBQVdGLFVBQVU7WUFDNUUsTUFBTWUsZUFBdUQ7Z0JBQzNEQyxJQUFJO29CQUNGQyxRQUFRO29CQUNSQyxRQUFRO29CQUNSQyxNQUFNO2dCQUNSO2dCQUNBQyxJQUFJO29CQUNGSCxRQUFRO29CQUNSQyxRQUFRO29CQUNSQyxNQUFNO2dCQUNSO1lBQ0Y7WUFFQSxNQUFNRSxZQUFZTixZQUFZLENBQUNmLFNBQVMsRUFBRSxDQUFDRSxRQUFRO1lBRW5ELElBQUltQixXQUFXO2dCQUNiLE1BQU1DLFNBQVMsTUFBTTlCLE9BQU84QixNQUFNLENBQUNDLElBQUksQ0FBQztvQkFDdENDLFNBQVNIO29CQUNUSSxRQUFRO2dCQUNWO2dCQUVBLElBQUlILE9BQU9JLElBQUksQ0FBQ0MsTUFBTSxHQUFHLEdBQUc7b0JBQzFCaEIsVUFBVUMsSUFBSSxDQUFDO3dCQUNiQyxPQUFPUyxPQUFPSSxJQUFJLENBQUMsRUFBRSxDQUFDRSxFQUFFO3dCQUN4QmQsVUFBVTtvQkFDWjtnQkFDRixPQUFPO29CQUNMUCxRQUFRRSxLQUFLLENBQUMsQ0FBQyw2QkFBNkIsRUFBRVksV0FBVztnQkFDM0Q7WUFDRixPQUFPO2dCQUNMZCxRQUFRRSxLQUFLLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRVQsU0FBUyxRQUFRLEVBQUVFLFNBQVM7WUFDbEY7UUFDRjtRQUVBLElBQUlTLFVBQVVnQixNQUFNLEtBQUssR0FBRztZQUMxQixPQUFPcEMscURBQVlBLENBQUNlLElBQUksQ0FBQztnQkFBRUcsT0FBTztZQUF1QixHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDNUU7UUFFQSwwREFBMEQ7UUFDMUQsTUFBTW1CLGVBQWUsTUFBTXJDLE9BQU9zQyxhQUFhLENBQUNDLE1BQU0sQ0FBQztZQUNyREMsVUFBVTVCO1lBQ1Y2QixPQUFPdEI7WUFDUHVCLHdCQUF3QjdCO1lBQ3hCOEIsVUFBVTtnQkFDUixHQUFJcEMsT0FBTztvQkFBRXFDLGNBQWNyQztnQkFBSSxDQUFDO2dCQUNoQyxHQUFJQyxZQUFZO29CQUFFQTtnQkFBUyxDQUFDO2dCQUM1QixHQUFJQyxlQUFlO29CQUFFQTtnQkFBWSxDQUFDO2dCQUNsQyxHQUFJQyxXQUFXO29CQUFFQTtnQkFBUSxDQUFDO1lBQzVCO1FBQ0Y7UUFFQSxPQUFPWCxxREFBWUEsQ0FBQ2UsSUFBSSxDQUFDO1lBQ3ZCK0IsU0FBUztZQUNUQyxnQkFBZ0JULGFBQWFELEVBQUU7WUFDL0JsQixRQUFRbUIsYUFBYW5CLE1BQU07UUFDN0I7SUFDRixFQUFFLE9BQU9ELE9BQU87UUFDZEYsUUFBUUUsS0FBSyxDQUFDLGdDQUFnQ0E7UUFDOUMsT0FBT2xCLHFEQUFZQSxDQUFDZSxJQUFJLENBQ3RCO1lBQUVHLE9BQU87UUFBZ0MsR0FDekM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRG1pdHJ5S2lwb3JlbmtvXFxEZXNrdG9wXFxuZXdcXHN1YnNjcmlwdGlvbnMtVUFIXFxhcHBcXGFwaVxcY3JlYXRlLXN1YnNjcmlwdGlvbi1kaXJlY3RcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdHJpcGUgZnJvbSAnc3RyaXBlJztcclxuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5cclxuY29uc3Qgc3RyaXBlID0gbmV3IFN0cmlwZShwcm9jZXNzLmVudi5TVFJJUEVfU0VDUkVUX0tFWSEsIHtcclxuICBhcGlWZXJzaW9uOiAnMjAyNS0wNi0zMC5iYXNpbCcsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxOiBSZXF1ZXN0KSB7XHJcbiAgY29uc3QgeyBcclxuICAgIHJlZiwgXHJcbiAgICBsb2NhdGlvbiwgXHJcbiAgICBwcm9kdWN0VHlwZSwgXHJcbiAgICBzbGFUaWVyLCBcclxuICAgIGluY2x1ZGVTdWJzY3JpcHRpb24sIFxyXG4gICAgY3VzdG9tZXJJZCwgXHJcbiAgICBwYXltZW50TWV0aG9kSWQgXHJcbiAgfSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcbiAgXHJcbiAgY29uc29sZS5sb2coJ2NyZWF0ZS1zdWJzY3JpcHRpb24tZGlyZWN0IHJlY2VpdmVkOicsIHsgXHJcbiAgICByZWYsIFxyXG4gICAgbG9jYXRpb24sIFxyXG4gICAgcHJvZHVjdFR5cGUsIFxyXG4gICAgc2xhVGllciwgXHJcbiAgICBpbmNsdWRlU3Vic2NyaXB0aW9uLCBcclxuICAgIGN1c3RvbWVySWQsIFxyXG4gICAgcGF5bWVudE1ldGhvZElkIFxyXG4gIH0pO1xyXG5cclxuICBpZiAoIWN1c3RvbWVySWQgfHwgIXBheW1lbnRNZXRob2RJZCkge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IGVycm9yOiAnQ3VzdG9tZXIgSUQgYW5kIFBheW1lbnQgTWV0aG9kIElEIGFyZSByZXF1aXJlZCcgfSwgXHJcbiAgICAgIHsgc3RhdHVzOiA0MDAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBsaW5lSXRlbXM6IGFueVtdID0gW107XHJcblxyXG4gICAgLy8gQWRkIHN1YnNjcmlwdGlvbiBpZiBzZWxlY3RlZFxyXG4gICAgaWYgKGluY2x1ZGVTdWJzY3JpcHRpb24pIHtcclxuICAgICAgbGluZUl0ZW1zLnB1c2goe1xyXG4gICAgICAgIHByaWNlOiAncHJpY2VfMVJUZHJDUmo4MWRqeGhvMmxQZ3VzbjE1JywgLy8gU3Vic2NyaXB0aW9uIHByaWNlIElEXHJcbiAgICAgICAgcXVhbnRpdHk6IDEsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBTTEEgcHJvZHVjdCBpZiBzZWxlY3RlZFxyXG4gICAgaWYgKChwcm9kdWN0VHlwZSA9PT0gJ1NMQScgfHwgcHJvZHVjdFR5cGUgPT09ICdCb3RoJykgJiYgc2xhVGllciAmJiBsb2NhdGlvbikge1xyXG4gICAgICBjb25zdCBwcm9kdWN0SWRNYXA6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+ID0ge1xyXG4gICAgICAgIEVVOiB7XHJcbiAgICAgICAgICBCcm9uemU6ICdwcm9kX1NqOG5BQlpsdW96SzRLJyxcclxuICAgICAgICAgIFNpbHZlcjogJ3Byb2RfU2o4bmpKSTlrbWI0ZGknLFxyXG4gICAgICAgICAgR29sZDogJ3Byb2RfU2o4bm5sM2lDTmRxR00nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgVVM6IHtcclxuICAgICAgICAgIEJyb256ZTogJ3Byb2RfU2o4THhUd0xVZnprNXQnLFxyXG4gICAgICAgICAgU2lsdmVyOiAncHJvZF9TajhMazZlcHJCRVEzaycsXHJcbiAgICAgICAgICBHb2xkOiAncHJvZF9TajhMdDRORGJaekk1aScsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IHByb2R1Y3RJZCA9IHByb2R1Y3RJZE1hcFtsb2NhdGlvbl0/LltzbGFUaWVyXTtcclxuICAgICAgXHJcbiAgICAgIGlmIChwcm9kdWN0SWQpIHtcclxuICAgICAgICBjb25zdCBwcmljZXMgPSBhd2FpdCBzdHJpcGUucHJpY2VzLmxpc3Qoe1xyXG4gICAgICAgICAgcHJvZHVjdDogcHJvZHVjdElkLFxyXG4gICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocHJpY2VzLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgbGluZUl0ZW1zLnB1c2goe1xyXG4gICAgICAgICAgICBwcmljZTogcHJpY2VzLmRhdGFbMF0uaWQsXHJcbiAgICAgICAgICAgIHF1YW50aXR5OiAxLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFByaWNlIG5vdCBmb3VuZCBmb3IgcHJvZHVjdDogJHtwcm9kdWN0SWR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFByb2R1Y3QgSUQgbm90IGZvdW5kIGZvciBsb2NhdGlvbjogJHtsb2NhdGlvbn0sIHRpZXI6ICR7c2xhVGllcn1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChsaW5lSXRlbXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm8gcHJvZHVjdHMgc2VsZWN0ZWQnIH0sIHsgc3RhdHVzOiA0MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHN1YnNjcmlwdGlvbiBkaXJlY3RseSB1c2luZyBzYXZlZCBwYXltZW50IG1ldGhvZFxyXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXdhaXQgc3RyaXBlLnN1YnNjcmlwdGlvbnMuY3JlYXRlKHtcclxuICAgICAgY3VzdG9tZXI6IGN1c3RvbWVySWQsXHJcbiAgICAgIGl0ZW1zOiBsaW5lSXRlbXMsXHJcbiAgICAgIGRlZmF1bHRfcGF5bWVudF9tZXRob2Q6IHBheW1lbnRNZXRob2RJZCxcclxuICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAuLi4ocmVmICYmIHsgcmVmZXJyYWxDb2RlOiByZWYgfSksXHJcbiAgICAgICAgLi4uKGxvY2F0aW9uICYmIHsgbG9jYXRpb24gfSksXHJcbiAgICAgICAgLi4uKHByb2R1Y3RUeXBlICYmIHsgcHJvZHVjdFR5cGUgfSksXHJcbiAgICAgICAgLi4uKHNsYVRpZXIgJiYgeyBzbGFUaWVyIH0pLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgc3Vic2NyaXB0aW9uSWQ6IHN1YnNjcmlwdGlvbi5pZCxcclxuICAgICAgc3RhdHVzOiBzdWJzY3JpcHRpb24uc3RhdHVzXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgc3Vic2NyaXB0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgc3Vic2NyaXB0aW9uJyB9LCBcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJTdHJpcGUiLCJOZXh0UmVzcG9uc2UiLCJzdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVF9LRVkiLCJhcGlWZXJzaW9uIiwiUE9TVCIsInJlcSIsInJlZiIsImxvY2F0aW9uIiwicHJvZHVjdFR5cGUiLCJzbGFUaWVyIiwiaW5jbHVkZVN1YnNjcmlwdGlvbiIsImN1c3RvbWVySWQiLCJwYXltZW50TWV0aG9kSWQiLCJqc29uIiwiY29uc29sZSIsImxvZyIsImVycm9yIiwic3RhdHVzIiwibGluZUl0ZW1zIiwicHVzaCIsInByaWNlIiwicXVhbnRpdHkiLCJwcm9kdWN0SWRNYXAiLCJFVSIsIkJyb256ZSIsIlNpbHZlciIsIkdvbGQiLCJVUyIsInByb2R1Y3RJZCIsInByaWNlcyIsImxpc3QiLCJwcm9kdWN0IiwiYWN0aXZlIiwiZGF0YSIsImxlbmd0aCIsImlkIiwic3Vic2NyaXB0aW9uIiwic3Vic2NyaXB0aW9ucyIsImNyZWF0ZSIsImN1c3RvbWVyIiwiaXRlbXMiLCJkZWZhdWx0X3BheW1lbnRfbWV0aG9kIiwibWV0YWRhdGEiLCJyZWZlcnJhbENvZGUiLCJzdWNjZXNzIiwic3Vic2NyaXB0aW9uSWQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/create-subscription-direct/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-subscription-direct%2Froute&page=%2Fapi%2Fcreate-subscription-direct%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-subscription-direct%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-subscription-direct%2Froute&page=%2Fapi%2Fcreate-subscription-direct%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-subscription-direct%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_create_subscription_direct_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/create-subscription-direct/route.ts */ \"(rsc)/./app/api/create-subscription-direct/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/create-subscription-direct/route\",\n        pathname: \"/api/create-subscription-direct\",\n        filename: \"route\",\n        bundlePath: \"app/api/create-subscription-direct/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\DmitryKiporenko\\\\Desktop\\\\new\\\\subscriptions-UAH\\\\app\\\\api\\\\create-subscription-direct\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_DmitryKiporenko_Desktop_new_subscriptions_UAH_app_api_create_subscription_direct_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjcmVhdGUtc3Vic2NyaXB0aW9uLWRpcmVjdCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY3JlYXRlLXN1YnNjcmlwdGlvbi1kaXJlY3QlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjcmVhdGUtc3Vic2NyaXB0aW9uLWRpcmVjdCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEbWl0cnlLaXBvcmVua28lNUNEZXNrdG9wJTVDbmV3JTVDc3Vic2NyaXB0aW9ucy1VQUglNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0RtaXRyeUtpcG9yZW5rbyU1Q0Rlc2t0b3AlNUNuZXclNUNzdWJzY3JpcHRpb25zLVVBSCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDMkQ7QUFDeEk7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxzdWJzY3JpcHRpb25zLVVBSFxcXFxhcHBcXFxcYXBpXFxcXGNyZWF0ZS1zdWJzY3JpcHRpb24tZGlyZWN0XFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jcmVhdGUtc3Vic2NyaXB0aW9uLWRpcmVjdC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NyZWF0ZS1zdWJzY3JpcHRpb24tZGlyZWN0XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jcmVhdGUtc3Vic2NyaXB0aW9uLWRpcmVjdC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXERtaXRyeUtpcG9yZW5rb1xcXFxEZXNrdG9wXFxcXG5ld1xcXFxzdWJzY3JpcHRpb25zLVVBSFxcXFxhcHBcXFxcYXBpXFxcXGNyZWF0ZS1zdWJzY3JpcHRpb24tZGlyZWN0XFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-subscription-direct%2Froute&page=%2Fapi%2Fcreate-subscription-direct%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-subscription-direct%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/stripe","vendor-chunks/qs","vendor-chunks/object-inspect","vendor-chunks/get-intrinsic","vendor-chunks/side-channel-list","vendor-chunks/side-channel-weakmap","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/side-channel-map","vendor-chunks/side-channel","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/call-bound","vendor-chunks/es-errors","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/es-object-atoms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-subscription-direct%2Froute&page=%2Fapi%2Fcreate-subscription-direct%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-subscription-direct%2Froute.ts&appDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDmitryKiporenko%5CDesktop%5Cnew%5Csubscriptions-UAH&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();