import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-container';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Implement accordion for footer sections on mobile
  const footerSections = footer.querySelectorAll('.default-content-wrapper');
  footerSections.forEach((section) => {
    const headings = section.querySelectorAll('h2, h3, h4');
    headings.forEach((heading) => {
      heading.classList.add('footer-heading');
      heading.addEventListener('click', () => {
        const isExpanded = heading.classList.contains('expanded');
        // Close all others
        headings.forEach(h => {
          h.classList.remove('expanded');
          const ul = h.nextElementSibling;
          if (ul && ul.tagName === 'UL') {
            ul.classList.remove('expanded');
          }
        });
        
        // Toggle current
        if (!isExpanded) {
          heading.classList.add('expanded');
          const ul = heading.nextElementSibling;
          if (ul && ul.tagName === 'UL') {
            ul.classList.add('expanded');
          }
        }
      });
    });
  });

  block.append(footer);
}
