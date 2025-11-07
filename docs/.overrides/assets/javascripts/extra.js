// Configure MathJax for pymdownx.arithmatex
window.MathJax = {
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

// Auto-collapse inactive course sections when a course is selected
(function() {
  'use strict';
  
  function collapseInactiveCourses() {
    // Wait for navigation to be ready
    setTimeout(function() {
      const primaryNav = document.querySelector('.md-nav--primary');
      if (!primaryNav) return;
      
      // Find all top-level course sections (items after Home)
      const navItems = primaryNav.querySelectorAll('.md-nav__list > .md-nav__item--nested');
      const currentPath = window.location.pathname;
      
      navItems.forEach(function(item) {
        const link = item.querySelector('.md-nav__link');
        if (!link) return;
        
        const href = link.getAttribute('href');
        const isActive = currentPath.includes(href) || 
                        item.querySelector('.md-nav__link--active') ||
                        item.classList.contains('md-nav__item--active');
        
        const nestedNav = item.querySelector('> .md-nav');
        if (nestedNav) {
          if (isActive) {
            item.classList.add('md-nav__item--active');
            nestedNav.style.display = 'block';
          } else {
            item.classList.remove('md-nav__item--active');
            nestedNav.style.display = 'none';
          }
        }
      });
    }, 100);
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collapseInactiveCourses);
  } else {
    collapseInactiveCourses();
  }
  
  // Run on navigation (for SPA-like behavior)
  window.addEventListener('hashchange', collapseInactiveCourses);
  
  // Also run when navigation links are clicked
  document.addEventListener('click', function(e) {
    if (e.target.closest('.md-nav__link')) {
      setTimeout(collapseInactiveCourses, 200);
    }
  });
})();

