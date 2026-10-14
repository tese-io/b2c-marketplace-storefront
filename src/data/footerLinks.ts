/**
 * Footer navigation. Labels are translation keys under `footer.links` rather
 * than copy, so the footer reads in the visitor's language. Social networks keep
 * their brand names, which are not translated.
 */
const links = {
  customerServices: [
    { key: 'faqs', path: '#' },
    { key: 'trackOrder', path: '#' },
    { key: 'returns', path: '#' },
    { key: 'delivery', path: '#' },
    { key: 'payment', path: '#' }
  ],
  about: [
    { key: 'aboutUs', path: '#' },
    { key: 'blog', path: '#' },
    { key: 'privacyPolicy', path: '#' },
    { key: 'termsConditions', path: '#' }
  ],
  connect: [
    { name: 'Facebook', path: 'https://facebook.com' },
    { name: 'Instagram', path: 'https://instagram.com' },
    { name: 'LinkedIn', path: 'https://linkedin.com' }
  ]
};

export default links;
