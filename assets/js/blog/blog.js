document.addEventListener('DOMContentLoaded', function() {

    // --- Theme Management (Copied from main.js/blog1.js) ---
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    let theme = 'dark'; // Default theme
    if (currentTheme) {
        theme = currentTheme;
    } else {
        theme = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const updateToggleButtonAria = (currentTheme) => {
        const label = currentTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
        if(themeToggle) {
           themeToggle.setAttribute('aria-label', label);
        }
    };
    updateToggleButtonAria(theme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleButtonAria(newTheme);
        });
    }

    // --- Mobile Navigation (Copied from main.js/blog1.js) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = !this.classList.contains('active');
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded.toString());
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        const closeMobileMenu = () => {
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        };

        navLinks.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (event) => {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }

    // --- Navigation Highlight (Using data attributes - Copied from blog1.js) ---
     try {
         const currentPageType = document.documentElement.getAttribute('data-page'); // Should be 'blog-index'
         const navLinksAll = document.querySelectorAll('.nav-links a[data-nav]');

         navLinksAll.forEach(link => {
             link.classList.remove('active');
             link.removeAttribute('aria-current');
         });

         let activeLinkFound = false;

         if (currentPageType) {
             let navIdentifier = currentPageType;
             if (currentPageType === 'blog-post' || currentPageType === 'blog-index') {
                 navIdentifier = 'blogs'; // Map both to 'blogs' nav item
             }
             const matchingLink = document.querySelector(`.nav-links a[data-nav="${navIdentifier}"]`);
             if (matchingLink) {
                 matchingLink.classList.add('active');
                 matchingLink.setAttribute('aria-current', 'page');
                 activeLinkFound = true;
             }
         }

         // Fallback (less likely needed with data-page, but keep for robustness)
        if (!activeLinkFound) {
            const currentLocation = window.location.pathname;
            navLinksAll.forEach(link => {
                let linkPathname = link.pathname;
                 if (linkPathname.endsWith('/index.html')) {
                    linkPathname = linkPathname.substring(0, linkPathname.length - 'index.html'.length);
                 }
                let currentPath = currentLocation;
                 if (currentPath.endsWith('/index.html')) {
                    currentPath = currentPath.substring(0, currentPath.length - 'index.html'.length);
                 }
                 if (linkPathname === currentPath) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                    activeLinkFound = true;
                 }
             });
         }

         // Final Fallback for Root/Home Page
          if (!activeLinkFound && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html'))) {
              const homeLink = document.querySelector('.nav-links a[data-nav="home"]');
              if (homeLink) {
                 homeLink.classList.add('active');
                 homeLink.setAttribute('aria-current', 'page');
              }
         }
     } catch (e) {
         console.error("Error setting active navigation link:", e);
     }


    // --- Scroll to Top Button (Copied from main.js/blog1.js) ---
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        });
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Intersection Observer for Post Card Animations (Copied from main.js/blog1.js) ---
    const animatedElements = document.querySelectorAll('.blog-post-card'); // Target blog cards specifically
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => { observer.observe(element); });
    } else {
        animatedElements.forEach(element => { element.classList.add('is-visible'); });
    }


    // --- Update Footer Year (Copied from main.js/blog1.js) ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }


    // --- Blog Listing Page Specific JS: Search, Filter, Pagination ---
    const searchInput = document.getElementById('blog-search-input');
    const categoryFilter = document.getElementById('blog-category-filter');
    const sidebarCategoryLinks = document.querySelectorAll('.category-widget-list a[data-category-filter]');
    const postsContainer = document.querySelector('.blog-posts-listing');
    const allPosts = postsContainer ? Array.from(postsContainer.querySelectorAll('.blog-post-card')) : [];
    const resultsMessage = document.getElementById('blog-results-message');

    // Pagination Elements
    const paginationPrev = document.getElementById('pagination-prev');
    const paginationNext = document.getElementById('pagination-next');
    const pageInfo = document.getElementById('page-info');
    const postsPerPage = 6; // <<< --- ADJUST NUMBER OF POSTS PER PAGE --- <<<
    let currentPage = 1;
    let filteredPosts = [...allPosts]; // Initially, all posts are potentially visible

    // Function to update the visible posts based on filters, search, and pagination
    const updateVisiblePosts = () => {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

        // 1. Filter by category and search term
        filteredPosts = allPosts.filter(post => {
            const category = post.dataset.category || 'all';
            const title = post.querySelector('h3 a')?.textContent.toLowerCase() || '';
            const excerpt = post.querySelector('p')?.textContent.toLowerCase() || '';
            const postCategory = post.querySelector('.post-category')?.textContent || '';

            const categoryMatch = selectedCategory === 'all' || category === selectedCategory || postCategory === selectedCategory;
            const searchMatch = searchTerm === '' || title.includes(searchTerm) || excerpt.includes(searchTerm);

            return categoryMatch && searchMatch;
        });

        // 2. Handle "No Results" Message
        if (resultsMessage) {
            if (filteredPosts.length === 0) {
                 let message = `No posts found`;
                 if(searchTerm) message += ` matching "${searchTerm}"`;
                 if(selectedCategory !== 'all') message += ` in the "${selectedCategory}" category`;
                 message += `.`;
                 resultsMessage.textContent = message;
                 resultsMessage.style.display = 'block';
            } else {
                resultsMessage.style.display = 'none';
            }
        }


        // 3. Apply Pagination
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        currentPage = Math.max(1, Math.min(currentPage, totalPages)); // Ensure current page is valid

        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;

        // Hide all posts initially, then show the ones for the current page
        allPosts.forEach(post => post.classList.add('hidden'));

        const postsToShow = filteredPosts.slice(startIndex, endIndex);
        postsToShow.forEach(post => post.classList.remove('hidden'));

        // 4. Update Pagination Controls
        if (pageInfo) {
             pageInfo.textContent = totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : 'Page 0 of 0';
        }
        if (paginationPrev) {
            paginationPrev.disabled = currentPage === 1;
        }
        if (paginationNext) {
             paginationNext.disabled = currentPage === totalPages || totalPages === 0;
        }

        // 5. Optional: Trigger animations again if posts become visible due to filtering
        // This might be complex if already animated; simpler to just ensure they are visible.
        postsToShow.forEach(post => {
             if (!post.classList.contains('is-visible')) {
                  // Could potentially re-add animation class if needed, but 'hidden' class removal might be enough
                   post.classList.add('is-visible'); // Make sure they are at least visible
             }
        });
    };

    // Event Listeners for Controls
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1; // Reset to first page on search
            updateVisiblePosts();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentPage = 1; // Reset to first page on filter change
            updateVisiblePosts();
            // Sync sidebar links (optional)
             const selectedValue = categoryFilter.value;
             sidebarCategoryLinks.forEach(link => {
                 link.classList.toggle('active-filter', link.dataset.categoryFilter === selectedValue);
             });
        });
    }

     // Event Listeners for Sidebar Category Links
     sidebarCategoryLinks.forEach(link => {
         link.addEventListener('click', (e) => {
             e.preventDefault();
             const category = link.dataset.categoryFilter;
             if (categoryFilter && category) {
                 categoryFilter.value = category; // Update the dropdown
                 currentPage = 1; // Reset page
                 updateVisiblePosts(); // Update the view

                 // Update active state on sidebar links
                 sidebarCategoryLinks.forEach(l => l.classList.remove('active-filter'));
                 link.classList.add('active-filter');
             }
         });
     });


    // Pagination Button Listeners
    if (paginationPrev) {
        paginationPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateVisiblePosts();
                // Optional: Scroll to top of posts grid after page change
                // postsContainer?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (paginationNext) {
        paginationNext.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateVisiblePosts();
                 // Optional: Scroll to top of posts grid after page change
                 // postsContainer?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Sidebar Newsletter Form Handling (Minimal Example) ---
    const sidebarNewsletterForms = document.querySelectorAll('.sidebar-newsletter-form');
    sidebarNewsletterForms.forEach(form => {
        const messageArea = form.nextElementSibling; // Assumes message div is immediately after form
        if(form && messageArea) {
             form.addEventListener('submit', (e) => {
                 e.preventDefault();
                 const emailInput = form.querySelector('input[type="email"]');
                 messageArea.textContent = 'Subscribing...';
                 messageArea.className = 'newsletter-message sidebar-newsletter-message'; // Reset class
                 messageArea.style.display = 'block';

                 // Simulate success/error
                 setTimeout(() => {
                     messageArea.textContent = 'Thanks! Check your inbox.';
                     messageArea.classList.add('success');
                     if(emailInput) emailInput.value = '';
                      // Optional: Hide message after a delay
                     setTimeout(() => { messageArea.style.display = 'none'; }, 4000);
                 }, 1000);
             });
        }
    });


    // --- Initial Setup ---
    if (allPosts.length > 0) {
        updateVisiblePosts(); // Initial display of posts and pagination state
         // Set initial active state for sidebar filter if needed (e.g., based on URL param)
         // For now, defaults to 'All Categories'
         document.querySelector('.category-widget-list a[data-category-filter="all"]')?.classList.add('active-filter');
    } else {
        // Handle case where no posts are found on the page at all
        if (resultsMessage) {
            resultsMessage.textContent = 'No blog posts available at this time.';
            resultsMessage.style.display = 'block';
        }
        if (pageInfo) pageInfo.textContent = 'Page 0 of 0';
        if (paginationPrev) paginationPrev.disabled = true;
        if (paginationNext) paginationNext.disabled = true;
    }


}); // End DOMContentLoaded