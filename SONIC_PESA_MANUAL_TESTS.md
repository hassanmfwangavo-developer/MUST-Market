# Sonic Pesa manual test procedure

Do not use production credentials or real customer funds. Keep `SONIC_PESA_ENABLED` unset or `false` until testing is approved.

1. Invalid phone: submit a malformed Tanzanian number; the server function must reject it before creating an order.
2. Browser-total tampering: alter client prices, fees, or totals in developer tools; the persisted order must use current `menu_items` values.
3. Duplicate clicks: click both payment buttons repeatedly; only one pending payment record should be active for the order.
4. Pending payment: use a provider response with `PENDING` or `INPROGRESS`; the UI must remain `Payment Pending`.
5. Successful payment: send a valid signed `payment.success` fixture with matching provider order ID, TZS currency, amount, and transaction/reference; the order becomes paid and rewards are awarded once.
6. Rejected payment: return `REJECTED`, `CANCELLED`, or `USERCANCELLED`; payment becomes failed and retry reuses the payment record.
7. Duplicate webhook: replay the exact signed payload; it must be acknowledged without a second reward award.
8. Invalid signature: change the signature or body; the webhook must return HTTP 400 and change nothing.
9. Mismatched amount: send a signed success payload with a different amount; the webhook must return HTTP 400 and leave the order pending.
10. Concurrent identical checkout requests: submit the same UUID request ID twice at once; both responses must identify the same order and only one pending payment may exist.
11. Failed retry: after a failed payment, retry with a new checkout request ID or the existing order retry action; no duplicate active payment or order may be created.
12. Stored transaction mismatch: send a validly signed success webhook with a different transaction ID or reference; it must return HTTP 400 and leave the order unpaid.
13. Changed signed body: alter the webhook body after calculating its signature; it must return HTTP 400.
14. Fabricated success state: open the success page with a fabricated history state; it must remain pending until a fetched order and confirmed payment report success.
