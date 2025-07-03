// Main application module
class App {
    constructor() {
        this.currentTab = 'admin';
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Tab switching
        document.getElementById('admin-tab').addEventListener('click', () => {
            this.switchTab('admin');
        });

        document.getElementById('preview-tab').addEventListener('click', () => {
            this.switchTab('preview');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 1: Admin tab
            if ((e.ctrlKey || e.metaKey) && e.key === '1') {
                e.preventDefault();
                this.switchTab('admin');
            }
            // Ctrl/Cmd + 2: Preview tab
            if ((e.ctrlKey || e.metaKey) && e.key === '2') {
                e.preventDefault();
                this.switchTab('preview');
            }
            // Escape: Hide form
            if (e.key === 'Escape') {
                dashboard.hideProductForm();
            }
        });

        // Window resize handler for charts
        window.addEventListener('resize', () => {
            if (this.currentTab === 'preview') {
                setTimeout(() => {
                    window.chartManager.updateCharts();
                }, 100);
            }
        });
    }

    // Switch between tabs
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        const adminTab = document.getElementById('admin-tab');
        const previewTab = document.getElementById('preview-tab');
        const adminContent = document.getElementById('admin-content');
        const previewContent = document.getElementById('preview-content');

        if (tabName === 'admin') {
            // Admin tab active
            adminTab.classList.add('active');
            adminTab.classList.remove('text-gray-500', 'hover:text-gray-700');
            adminTab.classList.add('bg-blue-100', 'text-blue-700');
            
            previewTab.classList.remove('active');
            previewTab.classList.add('text-gray-500', 'hover:text-gray-700');
            previewTab.classList.remove('bg-blue-100', 'text-blue-700');
            
            // Show admin content
            adminContent.classList.remove('hidden');
            previewContent.classList.add('hidden');
            
        } else if (tabName === 'preview') {
            // Preview tab active
            previewTab.classList.add('active');
            previewTab.classList.remove('text-gray-500', 'hover:text-gray-700');
            previewTab.classList.add('bg-blue-100', 'text-blue-700');
            
            adminTab.classList.remove('active');
            adminTab.classList.add('text-gray-500', 'hover:text-gray-700');
            adminTab.classList.remove('bg-blue-100', 'text-blue-700');
            
            // Show preview content
            previewContent.classList.remove('hidden');
            adminContent.classList.add('hidden');
            
            // Update charts when switching to preview
            setTimeout(() => {
                window.chartManager.recreateCharts();
                dashboard.updateSummaryStats();
            }, 100);
        }
    }

    // Initialize application
    async initialize() {
        try {
            // Show loading state
            this.showLoading();
            
            // Initialize dashboard
            await dashboard.initialize();
            
            // Hide loading state
            this.hideLoading();
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showError('애플리케이션 초기화 중 오류가 발생했습니다.');
        }
    }

    // Show loading state
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50';
        loadingDiv.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span class="text-gray-700">데이터를 불러오는 중...</span>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }

    // Hide loading state
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }

    // Show welcome message
    showWelcomeMessage() {
        const message = `
            <div class="message success">
                <strong>환영합니다!</strong> 제품별 손익구조 분석 대시보드가 성공적으로 로드되었습니다.
                <br><small>💡 팁: Ctrl+1 (관리자 모드), Ctrl+2 (미리보기), ESC (폼 닫기)</small>
            </div>
        `;
        
        const main = document.querySelector('main');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = message;
        main.insertBefore(tempDiv.firstElementChild, main.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            const welcomeMessage = document.querySelector('.message.success');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
        }, 5000);
    }

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        
        const main = document.querySelector('main');
        main.insertBefore(errorDiv, main.firstChild);
    }

    // Export data to JSON
    exportData() {
        const data = dataManager.getAllProducts();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `product-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Import data from JSON
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('잘못된 데이터 형식입니다.');
            }
            
            // Clear existing data and load new data
            dataManager.products = data;
            dataManager.applyFilters(dataManager.currentFilters.month, dataManager.currentFilters.brand);
            dataManager.updateBrandFilter();
            
            // Refresh UI
            dashboard.renderProductList();
            dashboard.updateSummaryStats();
            
            if (this.currentTab === 'preview') {
                window.chartManager.updateCharts();
            }
            
            dashboard.showMessage('데이터가 성공적으로 가져와졌습니다.', 'success');
            
        } catch (error) {
            dashboard.showMessage('데이터 가져오기 실패: ' + error.message, 'error');
        }
    }
}

// Create global app instance
const app = new App();

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Add some utility functions to global scope
window.app = app;
window.exportData = () => app.exportData();
window.importData = (file) => app.importData(file); 