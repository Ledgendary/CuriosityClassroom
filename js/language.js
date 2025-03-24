// language.js

// Function to switch the language of the web page
function changeLanguage(lang) {
  // Set the language of the content
  // ... Update your content based on the selected language ...
  
  // Save the selected language in localStorage
  localStorage.setItem('selectedLanguage', lang);
}

// Event listener for the language toggle switch
document.addEventListener('DOMContentLoaded', function() {
  var toggle = document.getElementById('language-toggle');
  
  toggle.addEventListener('change', function() {
    changeLanguage(this.checked ? 'es' : 'en');
  });

  // Initialize the content with the saved language preference
  var savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  changeLanguage(savedLanguage);
  
  // Set the toggle to match the saved preference
  toggle.checked = (savedLanguage === 'es');
});