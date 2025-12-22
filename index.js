const observerOptions = {
  threshold: 0.2 // Trigger when 20% of the section is visible
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // Optional: stop observing once it has faded in once
      // observer.unobserve(entry.target); 
    }
  });
}, observerOptions);

// Apply to all your sections
document.querySelectorAll('section').forEach(section => {
  section.classList.add('reveal-section');
  observer.observe(section);
});