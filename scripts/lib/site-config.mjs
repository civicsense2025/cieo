// Facts the site pages state. Anything left empty is shown honestly as not set up yet, never invented.
export const siteConfig = Object.freeze({
  name: 'Cieo',
  repo: 'https://github.com/civicsense2025/cieo',
  // The one-time suggested payment that funds the work, and where it is paid (a hosted Stripe payment link: the visitor
  // can pay the suggested amount or more). Empty link: the button stays inactive.
  support: Object.freeze({ amount: '$19.99', url: 'https://buy.stripe.com/7sY28q3Lk2Kn30o9Bp7Zu00' }),
  // Where the contact form posts. The Worker answers it; see worker/contact.js.
  contactEndpoint: '/api/contact',
});
