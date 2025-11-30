/**
 * Component Loader for Han Wang's Personal Website
 * Loads shared header and footer components to avoid duplication
 */

(function() {
    'use strict';

    /**
     * Fetch and inject a component
     * @param {string} componentPath - Path to the component HTML file
     * @param {string} targetSelector - CSS selector for the target container
     * @param {Object} config - Configuration object with template values
     * @param {function} callback - Optional callback after injection
     */
    function loadComponent(componentPath, targetSelector, config, callback) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        fetch(componentPath)
            .then(response => {
                if (!response.ok) throw new Error('Component not found: ' + componentPath);
                return response.text();
            })
            .then(html => {
                // Replace placeholders with actual values
                html = html.replace(/{BASE_PATH}/g, config.basePath);
                html = html.replace(/{LOGO_BOLD}/g, config.logoBold);
                html = html.replace(/{LOGO_TEXT}/g, config.logoText);
                
                target.innerHTML = html;

                // Show/hide BAIR logo based on config
                if (targetSelector === '#header-container') {
                    const bairLink = target.querySelector('.bair-link');
                    if (bairLink && config.showBairLogo) {
                        bairLink.style.display = '';
                    }
                }

                if (callback) callback();
            })
            .catch(error => {
                console.error('Error loading component:', error);
            });
    }

    /**
     * Initialize mobile menu overlay functionality
     * This needs to run after header is loaded
     */
    function initMobileMenu() {
        var triggerBttn = document.getElementById('trigger-overlay');
        var overlay = document.querySelector('div.overlay');
        
        if (!triggerBttn || !overlay) return;

        var closeBttn = overlay.querySelector('button.overlay-close');
        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        };
        var transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];
        var support = { transitions: Modernizr.csstransitions };

        function toggleOverlay() {
            if (classie.has(overlay, 'open')) {
                classie.remove(overlay, 'open');
                classie.add(overlay, 'close');
                var onEndTransitionFn = function(ev) {
                    if (support.transitions) {
                        if (ev.propertyName !== 'visibility') return;
                        this.removeEventListener(transEndEventName, onEndTransitionFn);
                    }
                    classie.remove(overlay, 'close');
                };
                if (support.transitions) {
                    overlay.addEventListener(transEndEventName, onEndTransitionFn);
                } else {
                    onEndTransitionFn();
                }
            } else if (!classie.has(overlay, 'close')) {
                classie.add(overlay, 'open');
            }
        }

        triggerBttn.addEventListener('click', toggleOverlay);
        if (closeBttn) {
            closeBttn.addEventListener('click', toggleOverlay);
        }
    }

    // Load components when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Detect if we're in a subdirectory (post pages)
        var isPostPage = window.location.pathname.includes('/post/');
        var basePath = isPostPage ? '../' : '';

        // Get page-specific configuration from data attributes on body or defaults
        var body = document.body;
        var config = {
            basePath: basePath,
            logoBold: (body.dataset && body.dataset.logoBold) || (isPostPage ? 'Research' : 'Han'),
            logoText: (body.dataset && body.dataset.logoText) || (isPostPage ? '& Project' : 'Wang'),
            showBairLogo: (body.dataset && body.dataset.showBairLogo !== 'false') && !isPostPage
        };

        // Load header
        loadComponent(basePath + 'components/header.html', '#header-container', config, function() {
            // Initialize mobile menu after header loads
            initMobileMenu();
        });

        // Load footer
        loadComponent(basePath + 'components/footer.html', '#footer-container', config);
    });
})();
