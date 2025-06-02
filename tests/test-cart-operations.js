// Cart Operations Test Script
// Run this in browser console to test cart functionality

console.log('🧪 Starting Cart Operations Test...');

// Test 1: Check if cart slice is properly imported and working
function testCartSliceIntegration() {
    console.log('\n📋 Test 1: Cart Slice Integration');
    
    // Check if Redux store is available
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
        console.log('✅ Redux DevTools available');
    }
    
    // Check if cart state exists in localStorage or sessionStorage
    const cartState = localStorage.getItem('persist:cart') || sessionStorage.getItem('cart');
    if (cartState) {
        console.log('✅ Cart state persistence found');
        try {
            const parsed = JSON.parse(cartState);
            console.log('Cart state:', parsed);
        } catch (e) {
            console.log('⚠️ Cart state parsing error:', e);
        }
    } else {
        console.log('ℹ️ No persisted cart state found (normal for fresh session)');
    }
}

// Test 2: Check if public courses are loaded
function testPublicCoursesLoading() {
    console.log('\n📚 Test 2: Public Courses Loading');
    
    // Check if courses are available in the DOM
    const courseElements = document.querySelectorAll('[data-testid="course-card"], .course-card, [class*="course"]');
    console.log(`Found ${courseElements.length} course-related elements`);
    
    // Check for course images
    const courseImages = document.querySelectorAll('img[alt*="course"], img[src*="course"]');
    console.log(`Found ${courseImages.length} course images`);
    
    // Check for "Add to Cart" or "Enrol" buttons
    const enrollButtons = document.querySelectorAll('button[class*="enrol"], button:contains("Enrol"), button:contains("Add to Cart")');
    console.log(`Found ${enrollButtons.length} enrol/cart buttons`);
}

// Test 3: Test cart page navigation and rendering
function testCartPageRendering() {
    console.log('\n🛒 Test 3: Cart Page Rendering');
    
    // Check if we're on cart page
    const isCartPage = window.location.pathname.includes('/cart');
    console.log(`Currently on cart page: ${isCartPage}`);
    
    if (isCartPage) {
        // Check for cart-specific elements
        const cartTitle = document.querySelector('h1:contains("Your Cart"), h1[class*="cart"], [data-testid="cart-title"]');
        console.log(`Cart title found: ${!!cartTitle}`);
        
        // Check for enhanced course items
        const enhancedItems = document.querySelectorAll('[class*="enhanced"], [data-testid="enhanced-course-item"]');
        console.log(`Enhanced course items found: ${enhancedItems.length}`);
        
        // Check for payment breakdown
        const paymentBreakdown = document.querySelector('[class*="payment-breakdown"], [data-testid="payment-breakdown"]');
        console.log(`Payment breakdown found: ${!!paymentBreakdown}`);
        
        // Check for checkout button
        const checkoutButton = document.querySelector('button:contains("Proceed to Checkout"), button[class*="checkout"]');
        console.log(`Checkout button found: ${!!checkoutButton}`);
        
        // Check for remove buttons
        const removeButtons = document.querySelectorAll('button[aria-label*="Remove"], button[class*="remove"], svg[class*="trash"]');
        console.log(`Remove buttons found: ${removeButtons.length}`);
    }
}

// Test 4: Test component interactions
function testComponentInteractions() {
    console.log('\n🔄 Test 4: Component Interactions');
    
    // Test expand/collapse functionality
    const expandButtons = document.querySelectorAll('button[class*="expand"], button[aria-label*="expand"], svg[class*="chevron"]');
    console.log(`Expand/collapse buttons found: ${expandButtons.length}`);
    
    // Test collapsible sections in payment breakdown
    const collapsibleSections = document.querySelectorAll('[data-state="open"], [data-state="closed"], [class*="collapsible"]');
    console.log(`Collapsible sections found: ${collapsibleSections.length}`);
    
    // Check for toast notifications container
    const toastContainer = document.querySelector('[data-testid="toast"], [class*="toast"], [role="alert"]');
    console.log(`Toast container found: ${!!toastContainer}`);
}

// Test 5: Test error handling and edge cases
function testErrorHandling() {
    console.log('\n⚠️ Test 5: Error Handling');
    
    // Check console for any errors
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
        errors.push(args);
        originalError.apply(console, args);
    };
    
    setTimeout(() => {
        console.error = originalError;
        if (errors.length > 0) {
            console.log(`❌ Found ${errors.length} console errors:`, errors);
        } else {
            console.log('✅ No console errors detected');
        }
    }, 2000);
    
    // Check for error boundaries or error messages
    const errorMessages = document.querySelectorAll('[class*="error"], [role="alert"][class*="destructive"]');
    console.log(`Error messages found: ${errorMessages.length}`);
}

// Test 6: Test responsive design
function testResponsiveDesign() {
    console.log('\n📱 Test 6: Responsive Design');
    
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    console.log(`Current viewport: ${viewport.width}x${viewport.height}`);
    
    // Check for responsive classes
    const responsiveElements = document.querySelectorAll('[class*="lg:"], [class*="md:"], [class*="sm:"]');
    console.log(`Elements with responsive classes: ${responsiveElements.length}`);
    
    // Check grid layout
    const gridElements = document.querySelectorAll('[class*="grid"], [class*="flex"]');
    console.log(`Grid/flex layout elements: ${gridElements.length}`);
}

// Test 7: Test data flow and state management
function testDataFlow() {
    console.log('\n🔄 Test 7: Data Flow and State Management');
    
    // Check if React DevTools is available
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools available');
    }
    
    // Check for data attributes that indicate proper data binding
    const dataElements = document.querySelectorAll('[data-course-id], [data-cart-item], [data-price]');
    console.log(`Elements with data attributes: ${dataElements.length}`);
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="skeleton"], [aria-busy="true"]');
    console.log(`Loading state elements: ${loadingElements.length}`);
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running comprehensive cart functionality tests...');
    
    testCartSliceIntegration();
    testPublicCoursesLoading();
    testCartPageRendering();
    testComponentInteractions();
    testErrorHandling();
    testResponsiveDesign();
    testDataFlow();
    
    console.log('\n✅ All tests completed! Check individual test results above.');
    console.log('💡 To test specific functionality:');
    console.log('   - Navigate to /cart to test cart page');
    console.log('   - Add items to cart from course pages');
    console.log('   - Try removing items and expanding course details');
    console.log('   - Test the checkout flow');
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
    runAllTests();
} else {
    console.log('This script should be run in a browser environment');
}

// Export functions for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testCartSliceIntegration,
        testPublicCoursesLoading,
        testCartPageRendering,
        testComponentInteractions,
        testErrorHandling,
        testResponsiveDesign,
        testDataFlow,
        runAllTests
    };
}
