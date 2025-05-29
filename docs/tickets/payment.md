**Comprehensive Payment Flow (Redirect Method with Paystack)**

**Goal:** User selects items, proceeds to checkout, pays via Paystack (redirect), and upon successful payment and verification, gets enroled in courses and sees a success message on their dashboard.

**Key Principle:** The backend is the source of truth for payment status and constructs the `callback_url` sent to Paystack. The frontend `PaymentRecord` type does not have a `metadata` field, so the backend must "stuff" stringified metadata into an existing field (e.g., `gatewayRef` or `description`) of the `PaymentRecord` it returns after verification, for the frontend callback page to parse and use for enrolment.

---

**Phase 1: Checkout Preparation (Frontend - `CheckoutPage.tsx`)**

1.  **User Authentication & Cart Population:**
    - User is logged in (`isAuthenticated === true`).
    - `cartItems` are populated in the Redux store.
    - `publicCourses` are fetched to get pricing and details.
2.  **Prepare Checkout (`useEffect` triggering `dispatch(prepareCheckout(...))`):**
    - `checkoutSlice`'s `prepareCheckout` reducer is called.
    - It iterates through `cartItems` and `publicCourses` to create `checkoutItems` (type `CheckoutItem`).
    - It calculates `totalAmount` based on user type (individual, corporate manager), corporate pricing, student counts, and discounts.
    - Sets `checkoutStatus` to `"ready"`.
    - The `CheckoutPage` displays the order summary and total.
3.  **User Clicks "Proceed to Payment" (`initiatePayment` function on `CheckoutPage.tsx`):**
    - Validations are performed (checkout ready, total amount valid, user email exists).
    - `dispatch(setShowPaymentModal(true))` is called. This opens a `Dialog`.

---

**Phase 2: Payment Initiation (Frontend Modal `PaystackCheckout.tsx` -> Backend -> Paystack)**

4.  **Payment Modal Opens (Frontend - `CheckoutPage.tsx` renders `Dialog` with `PaystackCheckout.tsx`):**
    - `PaystackCheckout` component receives props: `invoiceId` (dynamically generated), `courseTitle`, `amount` (totalAmount from checkoutSlice, **ensure this is in KOBO**), `email` (user.email), `userId`.
5.  **User Clicks "Pay ₦X Securely" (Frontend - `handlePaymentAttempt` in `PaystackCheckout.tsx`):**
    - `isProcessingPayment` state is set to `true`.
    - **Zero Amount Check:** If `amount === 0`, `onComponentSuccess` (which is `handlePaymentSuccess` on `CheckoutPage`) is called with mock reference data.
      - _`CheckoutPage.handlePaymentSuccess` -> `dispatch(enrolCoursesAfterPayment(...))` directly._ (Flow ends here for free items)
    - **Paid Amount:**
      - `dispatch(initiatePayment(payloadForThunk))` is called.
        - `payloadForThunk` (type `Omit<InitiatePaymentPayload, 'callbackUrl'>`): `{ invoiceId, amount }`.
        - **Inside `initiatePayment` thunk (in `payment-slice.ts`):**
          - `baseClientUrl = process.env.NEXT_PUBLIC_BASE_URL` is retrieved.
          - `payloadForBackend` (type `InitiatePaymentPayload`) is constructed: `{ ...callerPayload, callbackUrl: \`\${baseClientUrl}/payment/callback\` }`.
          - An API call `POST /api/payments/initialize` is made to the backend with `payloadForBackend`.
6.  **Backend Processing (`POST /api/payments/initialize`):**
    - **Input:** `invoiceId`, `amount` (KOBO), `callbackUrl` (from frontend).
    - **Action:**
      1.  Authenticates user, gets `userId`, `userEmail`.
      2.  **Crucial Data Retrieval:** Uses `invoiceId` to fetch the actual cart/order details from its database (which course IDs, quantities, user type for this order, corporate details). **This step is VITAL because the frontend `InitiatePaymentPayload` (as per your types) doesn't pass `courseIds`, etc.**
      3.  **Determine Final `callback_url` for Paystack:**
          - **Recommended & Secure:** Ignores `callbackUrl` from client. Uses its own `process.env.APP_BASE_URL + "/payment/callback"`.
          - _(Alternative, less secure):_ If using `callbackUrl` from client, **VALIDATE IT STRICTLY** against whitelisted domains and paths.
      4.  **Construct `metadata` for Paystack:** Using `invoiceId`, `userId`, `userEmail`, and the fetched cart details (`course_ids`, `is_corporate_purchase`, `corporate_student_count`).
      5.  **Create Pending `PaymentRecord` in DB:** Status "pending", include `invoiceId` (e.g., in `transactionId` or `description`), `userId`, `amount`.
      6.  **Call Paystack's `/transaction/initialize` API:** With `email`, `amount`, the determined `callback_url`, and the `metadata`. (Uses **Secret Key**)
      7.  **On success from Paystack:** Get `authorization_url`, `reference`. Update DB `PaymentRecord` with `providerReference = reference`.
      8.  **Return `PaymentResponse` to frontend:**
          ```json
          {
          	"success": true,
          	"data": {
          		"payment": {
          			/* The pending PaymentRecord from DB */
          		},
          		"authorizationUrl": "PAYSTACK_AUTH_URL"
          	}
          }
          ```
7.  **Frontend Receives Initialization Response (`initiatePayment` thunk in `PaystackCheckout.tsx`):**
    - `result` (type `PaymentResponse`) is received.
    - `payment-slice` updates `state.currentPayment` with `result.payment` and `state.paymentInitialization` with `result.authorizationUrl`.
    - **If `IS_LIVE_API` and `result.authorizationUrl` exists:**
      - `window.location.href = result.authorizationUrl;` -> **User is redirected to Paystack's site.**
    - **If MOCK mode:**
      - `PaystackCheckout.tsx` simulates success, calls `onComponentSuccess` (which is `CheckoutPage.handlePaymentSuccess`).
      - _`CheckoutPage.handlePaymentSuccess` -> `dispatch(enrolCoursesAfterPayment(...))`._ (Flow ends here for mock)

---

**Phase 3: Payment on Paystack & Redirect Back (Paystack -> Frontend Callback)**

8.  **User on Paystack's Page:** User enters payment details, completes 3D Secure if needed. Payment succeeds or fails.
9.  **Paystack Redirects User:** Paystack redirects the user's browser to your backend-configured `callback_url` (e.g., `https://yourdomain.com/payment/callback?reference=PAYSTACK_REF&trxref=PAYSTACK_REF`).

---

**Phase 4: Payment Verification & Enrolment (Frontend Callback Page -> Backend -> Frontend)**

10. **Callback Page Loads (Frontend - `app/payment/callback/page.tsx`):**
    - `PaymentCallbackContent` component mounts.
    - `Suspense` handles initial loading.
    - `useEffect` runs to get `reference`/`trxref` from `useSearchParams()`.
11. **Trigger Verification (`useEffect` in `PaymentCallbackContent`):**
    - If `paymentReference` is found and `verificationStatus` is `idle`:
      - `dispatch(verifyPayment({ reference: paymentReference }))`.
      - **Inside `verifyPayment` thunk (in `payment-slice.ts`):**
        - API call `GET /api/payments/verify/:reference` to backend.
12. **Backend Processing (`GET /api/payments/verify/:reference`):**
    - **Input:** `:reference` from URL.
    - **Action:**
      1.  Fetch internal `PaymentRecord` by `providerReference`.
      2.  Call Paystack's `/transaction/verify/:reference` API (Uses **Secret Key**).
      3.  Get Paystack's response (includes `data.status` and `data.metadata`).
      4.  **Validate amount/currency** against your DB record.
      5.  Update your DB `PaymentRecord` status (`succeeded` or `failed` based on Paystack).
      6.  **"Stuff" Metadata (Workaround):**
          - `const stringifiedMetadata = JSON.stringify(paystackResponse.data.data.metadata);`
          - Store this `stringifiedMetadata` into your DB `PaymentRecord`'s `gatewayRef` field (or `description`).
      7.  **Return `VerifyPaymentResponse` to frontend:**
          ```json
          {
          	"success": true,
          	"data": {
          		// 'payments' is plural in your type, assuming singular
          		"payments": {
          			/* Updated PaymentRecord from DB, with stringified metadata in gatewayRef/description */
          		},
          		"verification": {
          			/* Raw Paystack verification data if needed */
          		}
          	}
          }
          ```
13. **Frontend Receives Verification Response (`verifyPayment` thunk in `PaymentCallbackContent`):**
    - `payment-slice` updates `verificationStatus` to `"succeeded"` or `"failed"`.
    - `state.currentPayment` is updated with `response.data.payments` (the `PaymentRecord` which now has stringified metadata in its `gatewayRef` or `description`).
14. **Handle Verification Status (`useEffect` in `PaymentCallbackContent` reacting to `verificationStatus`):**
    - **If `verificationStatus === 'succeeded'` AND `verifiedPaymentDetails.status === 'succeeded'`)**:
      - Show "Payment Verified!" toast.
      - Call `getMetadataFromPaymentRecord(verifiedPaymentDetails)` to parse the stringified metadata from `verifiedPaymentDetails.gatewayRef` (or `description`). This yields `course_ids`, `invoice_id`, `is_corporate_purchase`, etc.
      - Construct `enrolmentPayload` (type `EnrolCoursesPayload`) using parsed metadata and `user.id`.
      - If `courseIdsToEnrol` exist (or `isCorporate`):
        - `dispatch(enrolCoursesAfterPayment(enrolmentPayload))`.
        - **Inside `enrolCoursesAfterPayment` thunk (in `checkoutSlice.ts`):**
          - API call `POST /api/enrolments/purchase` to backend.
15. **Backend Processing (`POST /api/enrolments/purchase`):**
    - **Input:** `userId`, `courseIds`, `paymentReference` (object), `totalAmountPaid`, etc.
    - **Action:**
      1.  Authenticate user.
      2.  **Server-Side Payment Validation:** Look up internal `PaymentRecord` using `paymentReference.reference`. Verify its `status` is "succeeded" and `amount` matches `totalAmountPaid`. Check for prior enrolment with this payment.
      3.  Perform course enrolment in DB.
      4.  Return `EnrolCoursesResponse` to frontend: `{ success: true, message: "...", enroledCourseIds: [...] }`.
16. **Frontend Receives Enrolment Response (`enrolCoursesAfterPayment` thunk in `PaymentCallbackContent`):**
    - `checkoutSlice` updates its status.
    - **On Fulfilled:**
      - Show "Enrolment Successful!" toast.
      - `dispatch(clearCart())`.
      - `dispatch(resetPaymentState())`.
      - `router.replace(\`/dashboard?payment_success=true&ref=\${paymentRefForUrl}\`);`
    - **On Rejected:**
      - Show "Enrolment Failed After Payment" toast.
      - `dispatch(resetPaymentState())`.
      - `router.replace(\`/payments/\${verifiedPaymentDetails.id}/receipt?status=enrolment_failed\`);` (or similar error indication page).
    - **If payment verified but metadata parsing failed for enrolment (e.g., no `course_ids`):**
      - Show "Enrolment Issue" toast.
      - `dispatch(resetPaymentState())`.
      - `router.replace(\`/payments/\${verifiedPaymentDetails.id}/receipt?status=enrolment_data_missing\`);`
    - **If `verificationStatus === 'succeeded'` BUT `verifiedPaymentDetails.status !== 'succeeded'` (Paystack said transaction failed):**
      - Show "Payment Not Successful" toast.
      - `dispatch(resetPaymentState())`.
      - `router.replace(\`/checkout?payment_status=declined&ref=\${paymentRefForUrl}\`);`
    - **If `verificationStatus === 'failed'` (communication issue with backend for verification):**
      - Show "Payment Verification Failed" toast.
      - `dispatch(resetPaymentState())`.
      - `router.replace(\`/checkout?payment_status=verification_failed&ref=\${paymentRefForUrl}\`);`

---

**Phase 5: User Lands on Final Page (Frontend)**

17. **Dashboard Page (`app/(authenticated)/dashboard/page.tsx`):**
    - `useEffect` reads `searchParams`.
    - If `payment_success=true`, displays a success toast.
    - If `status=enrolment_data_missing`, displays a warning toast.
    - Cleans the URL query parameters.
18. **Checkout Page (`app/(authenticated)/checkout/page.tsx`):**
    - `useEffect` reads `searchParams`.
    - If `payment_status=declined` or `payment_status=verification_failed`, displays an appropriate error toast.
    - Cleans the URL query parameters.
19. **Receipt Page (`app/payments/[id]/receipt/page.tsx`):**
    - `useEffect` reads `searchParams`.
    - If `status=enrolment_failed` or `status=enrolment_data_missing`, displays an appropriate alert message on the receipt.

---

This comprehensive flow outlines how all the pieces connect, emphasizing the backend's role in managing data securely and the frontend's role in orchestrating the user experience and state updates, all while trying to best utilize your existing type definitions. The "metadata stuffing" into `gatewayRef`/`description` by the backend is the key workaround needed due to the frontend `PaymentRecord` type lacking a direct `metadata` field.
