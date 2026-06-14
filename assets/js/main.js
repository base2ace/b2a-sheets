// Base2Ace Sheets Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
  // Select DOM Elements
  const searchInput = document.getElementById('sheetSearch');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sheetsGrid = document.getElementById('sheetsGrid');
  const countText = document.getElementById('resultsCountText');
  
  // State variables
  let currentFilter = 'all';
  let searchQuery = '';
  
  // Initialize App
  function init() {
    // Check if data is available
    if (typeof SHEETS_DATA === 'undefined') {
      console.error('SHEETS_DATA is not defined. Make sure assets/js/sheets-data.js is loaded.');
      sheetsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle" style="color: #E74C3C;"></i>
          <h4>Data File Missing</h4>
          <p>Please make sure assets/js/sheets-data.js has been generated successfully.</p>
        </div>
      `;
      return;
    }
    
    // Register event listeners
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => {
      btn.addEventListener('click', handleFilterClick);
    });
    
    // Initial Render
    renderSheets();
    animateStats();
  }

  // Grouping mapping logic
  function getFilterGroup(categoryKey) {
    if (/^l[1-8]/i.test(categoryKey)) return 'l1-l8';
    if (categoryKey === 'adv-l3') return 'adv';
    if (categoryKey === 'multiply') return 'multiply';
    if (categoryKey.toLowerCase().includes('division')) return 'division';
    if (categoryKey === 'exams') return 'exams';
    if (categoryKey === 'tables' || categoryKey === 'kahoot') return 'other';
    return 'other';
  }

  // Handle Search Input Change
  function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    renderSheets();
  }

  // Handle Filter Button Clicks
  function handleFilterClick(e) {
    // Update active class
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.getAttribute('data-filter');
    renderSheets();
  }

  // Filter sheets based on active criteria
  function getFilteredSheets() {
    return SHEETS_DATA.filter(sheet => {
      // 1. Category Filter Match
      const matchesCategory = 
        currentFilter === 'all' || 
        getFilterGroup(sheet.category_key) === currentFilter;
        
      // 2. Search Query Match
      const matchesSearch = 
        !searchQuery || 
        sheet.title.toLowerCase().includes(searchQuery) || 
        sheet.category.toLowerCase().includes(searchQuery) ||
        sheet.path.toLowerCase().includes(searchQuery);
        
      return matchesCategory && matchesSearch;
    });
  }

  // Render cards to UI grid
  function renderSheets() {
    const filtered = getFilteredSheets();
    
    // Update counts UI
    updateCounts(filtered.length);
    
    // Empty state check
    if (filtered.length === 0) {
      sheetsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search-minus"></i>
          <h4>No worksheets found</h4>
          <p>We couldn't find any sheets matching "${escapeHtml(searchInput.value)}". Try searching for something else!</p>
        </div>
      `;
      return;
    }
    
    // Build HTML fragment
    const cardsHtml = filtered.map(sheet => {
      // Get category class for badges
      const badgeClass = `badge-${sheet.category_key.replace(/[^a-zA-Z0-9-]/g, '')}`;
      
      // Select appropriate icon
      let cardIcon = 'fa-file-alt';
      if (sheet.category_key === 'multiply') cardIcon = 'fa-times';
      else if (sheet.category_key.includes('division')) cardIcon = 'fa-divide';
      else if (sheet.category_key === 'exams') cardIcon = 'fa-graduation-cap';
      else if (sheet.category_key === 'tables') cardIcon = 'fa-table';
      else if (sheet.category_key === 'kahoot') cardIcon = 'fa-gamepad';
      else if (/^l[1-8]/i.test(sheet.category_key)) cardIcon = 'fa-calculator';

      return `
        <article class="sheet-card" data-category="${sheet.category_key}">
          <div class="card-header">
            <span class="category-badge ${badgeClass}">${sheet.category}</span>
            <div class="sheet-icon-indicator">
              <i class="fas ${cardIcon}"></i>
            </div>
          </div>
          <h3>${escapeHtml(sheet.title)}</h3>
          <div class="card-footer">
            <span class="sheet-path-text" title="${sheet.path}">${sheet.path}</span>
            <a href="${sheet.path}" class="btn-open-sheet" target="_blank" rel="noopener noreferrer">
              <span>Open</span>
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </article>
      `;
    }).join('');
    
    sheetsGrid.innerHTML = cardsHtml;
  }

  // Update Result Count Text
  function updateCounts(length) {
    if (searchQuery || currentFilter !== 'all') {
      countText.innerHTML = `Showing <strong>${length}</strong> worksheets of <strong>${SHEETS_DATA.length}</strong> total`;
    } else {
      countText.innerHTML = `Total Worksheets: <strong>${SHEETS_DATA.length}</strong>`;
    }
  }

  // Quick stat cards counters animation
  function animateStats() {
    const totalSheetsElement = document.getElementById('statTotalSheets');
    const totalCategoriesElement = document.getElementById('statCategories');
    
    if (totalSheetsElement) {
      animateCounter(totalSheetsElement, SHEETS_DATA.length, 1000);
    }
    if (totalCategoriesElement) {
      // Find number of unique categories
      const categories = new Set(SHEETS_DATA.map(s => s.category_key));
      animateCounter(totalCategoriesElement, categories.size, 800);
    }
  }

  function animateCounter(element, targetValue, duration) {
    let startTime = null;
    const startValue = 0;
    
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
      element.textContent = currentValue;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = targetValue;
      }
    }
    
    window.requestAnimationFrame(step);
  }

  // Simple HTML Escaping helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start initialization
  init();
});
