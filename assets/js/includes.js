// assets/js/includes.js (or add to main.js)

document.addEventListener('DOMContentLoaded', function() {

    const loadComponent = (componentPath, placeholderId) => {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.error(`Placeholder element with ID '${placeholderId}' not found.`);
            return;
        }

        fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status} loading ${componentPath}`);
                }
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;

                // *** KEY CHANGE: Re-initialize scripts AFTER loading ***
                if (placeholderId === 'navbar-placeholder') {
                    initializeNavbarScripts(); // Specifically initialize navbar scripts
                }
                if (placeholderId === 'footer-placeholder') {
                    initializeFooterScripts(); // Initialize footer scripts
                }
            })
            .catch(error => {
                console.error(`Could not load component from ${componentPath}:`, error);
                placeholder.innerHTML = `<p style="color:red;">Error loading ${placeholderId.replace('-placeholder','')}.</p>`;
            });
    };

    // Determine Base Path (Use the option that works for your setup)
    const basePath = ''; // Using root-relative paths

    // Load Components
    loadComponent(`${basePath}/components/navbar.html`, 'navbar-placeholder');
    loadComponent(`${basePath}/components/footer.html`, 'footer-placeholder');


    // --- Function to specifically initialize NAVBAR JavaScript ---
    function initializeNavbarScripts() {
        console.log("Attempting to initialize Navbar scripts..."); // Debug log

        const menuToggle = document.querySelector('#navbar-placeholder .menu-toggle'); // Select within the placeholder
        const navLinks = document.querySelector('#navbar-placeholder .nav-links');   // Select within the placeholder

        if (menuToggle && navLinks) {
             console.log("Menu toggle and nav links found. Adding listeners."); // Debug log

            // --- Hamburger Menu Logic (Copied from main.js/blog1.js) ---
            menuToggle.addEventListener('click', function() {
                const isExpanded = !this.classList.contains('active');
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
                this.setAttribute('aria-expanded', isExpanded.toString());
                document.body.style.overflow = isExpanded ? 'hidden' : '';
                console.log("Menu toggled. Expanded:", isExpanded); // Debug log
            });

            const closeMobileMenu = () => {
                 if (navLinks.classList.contains('active')) {
                     menuToggle.classList.remove('active');
                     navLinks.classList.remove('active');
                     menuToggle.setAttribute('aria-expanded', 'false');
                     document.body.style.overflow = '';
                     console.log("Mobile menu closed."); // Debug log
                 }
             };

            navLinks.querySelectorAll('a').forEach(item => {
                item.addEventListener('click', closeMobileMenu);
            });

            // Note: Document-level listeners for closing might need careful handling
            // if added multiple times. It's often better to add these once outside
            // the component loader if possible, but check if they work correctly first.
            // If adding here, ensure they don't duplicate. A simple flag could prevent re-adding.

            // Example: Add document listeners only once
            if (!window.mobileNavDocumentListenersAdded) {
                 document.addEventListener('click', (event) => {
                     // Check if menuToggle exists before accessing contains
                     const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
                     const isClickInsideNav = navLinks.contains(event.target);
                     if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                         closeMobileMenu();
                     }
                 });

                 document.addEventListener('keydown', (event) => {
                     if (event.key === 'Escape') {
                         closeMobileMenu();
                     }
                 });
                 window.mobileNavDocumentListenersAdded = true; // Set flag
                 console.log("Document listeners for mobile nav added."); // Debug log
             }

        } else {
             console.log("Menu toggle or nav links NOT found inside #navbar-placeholder."); // Debug log
        }

        // --- Active Navigation Link Highlighting Logic (Copied from main.js/blog1.js) ---
        try {
             // Add your navigation link highlighting code here again
             // Ensure selectors target links within the loaded navbar, e.g.:
             // const navLinksAll = document.querySelectorAll('#navbar-placeholder .nav-links a[data-nav]');
             console.log("Navbar highlighting re-initialized.");
        } catch(e) { console.error("Error re-initializing nav highlighting:", e); }
    }

    // --- Function to specifically initialize FOOTER JavaScript ---
    function initializeFooterScripts() {
         // Add your footer year update code here
         // Add your scroll-to-top button code here
        const yearSpan = document.getElementById('current-year'); // Check if ID is inside footer placeholder
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
            console.log("Footer year updated.");
        }

         const scrollToTopButton = document.querySelector('.scroll-to-top'); // Check if button is inside footer placeholder
         if (scrollToTopButton) {
            // Add scroll/click listeners again
            console.log("Scroll-to-top button re-initialized.");
         }
    }

}); // End DOMContentLoaded/ End DOMContentLoaded