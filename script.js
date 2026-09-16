// Highlight the nav link matching the current page.
(function setActiveNavLink() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const linkFile = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', linkFile === path);
  });
})();
