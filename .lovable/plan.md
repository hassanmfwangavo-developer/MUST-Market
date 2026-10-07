# Dedicated Msosi Pre-Order Page

## Build
- Replace the Msosi banner popup action with direct navigation to `/preorder`.
- Create a shared standalone pre-order page used by both `/preorder` and `/msosi/preorder`.
- Keep the existing admin-managed meals and no-payment order submission flow.

## Page experience
- Add a focused header with “← Rudi Msosi Fasta”, the requested title, and supporting message.
- Present Lunch and Dinner as large visual radio cards with their ordering and delivery times.
- Show active meals in a mobile-first selectable list with images, prices, and quantity controls.
- Add hostel drop-zone selection and contact fields for name, Tanzanian phone number, and room details.
- Show the requested cancellation policy and a large green confirmation button.
- After submission, replace the form with a clean receipt containing the order reference, selected meals, batch, hostel, contact details, and total.

## Validation
- Confirm both URLs render the same experience.
- Test the full form submission flow, receipt state, mobile layout, and the updated Msosi banner link.
- Check route metadata and the app build.
