// Facts the site pages state. Anything left empty is shown honestly as not set up yet, never invented.
export const siteConfig = Object.freeze({
  name: 'Cieo',
  repo: 'https://github.com/civicsense2025/cieo',
  // The one-time suggested payment that funds the work, and where it is paid. Empty link: the button stays inactive.
  support: Object.freeze({ amount: '$19.99', url: '' }),
  // Where the contact form posts. The Worker answers it; see worker/contact.js.
  contactEndpoint: '/api/contact',
});
