// Dashboard functionality
class Dashboard {
    constructor() {
        this.currentEditId = null;
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showProductForm();
        });

        // Form submission
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideProductForm();
        });

        // Apply filter button
        document.getElementById('apply-filter').addEventListener('click', () => {
            this.applyFilters();
        });

        // Real-time calculation inputs
        const calculationInputs = [
            'price-input', 'cost-input', 'quantity-input', 
            'marketing-input', 'sales-cost-input', 'etc-cost-input'
        ];

        calculationInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('input', () => {
                this.updateCalculations();
            });
        });
    }

    // Show product form
    showProductForm(productId = null) {
        const form = document.getElementById('product-detail-form');
        form.classList.remove('hidden');

        if (productId) {
            // Edit mode
            this.currentEditId = productId;
            const product = dataManager.getProductById(productId);
            this.populateForm(product);
        } else {
            // Add mode
            this.currentEditId = null;
            this.clearForm();
        }

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    // Hide product form
    hideProductForm() {
        document.getElementById('product-detail-form').classList.add('hidden');
        this.currentEditId = null;
        this.clearForm();
    }

    // Populate form with product data
    populateForm(product) {
        document.getElementById('brand-input').value = product.brand;
        document.getElementById('product-name-input').value = product.name;
        document.getElementById('month-input').value = product.month;
        document.getElementById('price-input').value = product.price;
        document.getElementById('cost-input').value = product.cost;
        document.getElementById('quantity-input').value = product.quantity;
        document.getElementById('marketing-input').value = product.marketing;
        document.getElementById('sales-cost-input').value = product.sales;
        document.getElementById('etc-cost-input').value = product.etc;

        this.updateCalculations();
    }

    // Clear form
    clearForm() {
        document.getElementById('product-form').reset();
        this.updateCalculations();
    }

    // Handle form submission
    handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        try {
            if (this.currentEditId) {
                // Update existing product
                dataManager.updateProduct(this.currentEditId, formData);
                this.showMessage('제품이 성공적으로 수정되었습니다.', 'success');
            } else {
                // Add new product
                dataManager.addProduct(formData);
                this.showMessage('제품이 성공적으로 추가되었습니다.', 'success');
            }

            this.hideProductForm();
            this.renderProductList();
            this.updateSummaryStats();
            
            // Trigger chart updates if on preview tab
            if (document.getElementById('preview-content').classList.contains('hidden') === false) {
                window.chartManager.updateCharts();
            }
        } catch (error) {
            this.showMessage('오류가 발생했습니다: ' + error.message, 'error');
        }
    }

    // Get form data
    getFormData() {
        return {
            brand: document.getElementById('brand-input').value,
            name: document.getElementById('product-name-input').value,
            month: document.getElementById('month-input').value,
            price: parseInt(document.getElementById('price-input').value) || 0,
            cost: parseInt(document.getElementById('cost-input').value) || 0,
            quantity: parseInt(document.getElementById('quantity-input').value) || 0,
            marketing: parseInt(document.getElementById('marketing-input').value) || 0,
            sales: parseInt(document.getElementById('sales-cost-input').value) || 0,
            etc: parseInt(document.getElementById('etc-cost-input').value) || 0
        };
    }

    // Validate form data
    validateFormData(data) {
        if (!data.brand.trim()) {
            this.showMessage('브랜드를 입력해주세요.', 'error');
            return false;
        }
        if (!data.name.trim()) {
            this.showMessage('제품명을 입력해주세요.', 'error');
            return false;
        }
        if (data.price <= 0) {
            this.showMessage('판매가는 0보다 커야 합니다.', 'error');
            return false;
        }
        if (data.cost < 0) {
            this.showMessage('공급가는 0 이상이어야 합니다.', 'error');
            return false;
        }
        if (data.quantity <= 0) {
            this.showMessage('판매수량은 0보다 커야 합니다.', 'error');
            return false;
        }
        return true;
    }

    // Update calculations in real-time
    updateCalculations() {
        const formData = this.getFormData();
        const metrics = dataManager.calculateProductMetrics(formData);

        document.getElementById('total-revenue').textContent = dataManager.formatCurrency(metrics.totalRevenue);
        document.getElementById('total-cost').textContent = dataManager.formatCurrency(metrics.totalCost);
        document.getElementById('net-profit').textContent = dataManager.formatCurrency(metrics.netProfit);
        document.getElementById('profit-rate').textContent = dataManager.formatPercentage(metrics.profitRate);
    }

    // Apply filters
    applyFilters() {
        const month = document.getElementById('month-filter').value;
        const brand = document.getElementById('brand-filter').value;
        
        dataManager.applyFilters(month, brand);
        this.renderProductList();
        this.updateSummaryStats();
        
        // Update charts if on preview tab
        if (document.getElementById('preview-content').classList.contains('hidden') === false) {
            window.chartManager.updateCharts();
        }
    }

    // Render product list
    renderProductList() {
        const tbody = document.getElementById('product-tbody');
        const products = dataManager.getFilteredProducts();
        
        tbody.innerHTML = '';

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        표시할 제품이 없습니다.
                    </td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            const metrics = dataManager.calculateProductMetrics(product);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.brand}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${dataManager.formatCurrency(product.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.quantity.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${dataManager.formatCurrency(metrics.totalRevenue)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}">${dataManager.formatCurrency(metrics.netProfit)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${metrics.profitRate >= 0 ? 'text-purple-600' : 'text-red-600'}">${dataManager.formatPercentage(metrics.profitRate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="dashboard.editProduct('${product.id}')" class="text-blue-600 hover:text-blue-900 mr-3">수정</button>
                    <button onclick="dashboard.deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">삭제</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Edit product
    editProduct(productId) {
        this.showProductForm(productId);
    }

    // Delete product
    deleteProduct(productId) {
        if (confirm('정말로 이 제품을 삭제하시겠습니까?')) {
            if (dataManager.deleteProduct(productId)) {
                this.showMessage('제품이 성공적으로 삭제되었습니다.', 'success');
                this.renderProductList();
                this.updateSummaryStats();
                
                // Update charts if on preview tab
                if (document.getElementById('preview-content').classList.contains('hidden') === false) {
                    window.chartManager.updateCharts();
                }
            } else {
                this.showMessage('제품 삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    // Update summary statistics
    updateSummaryStats() {
        const stats = dataManager.getSummaryStats();
        
        document.getElementById('summary-total-revenue').textContent = dataManager.formatCurrency(stats.totalRevenue);
        document.getElementById('summary-total-cost').textContent = dataManager.formatCurrency(stats.totalCost);
        document.getElementById('summary-net-profit').textContent = dataManager.formatCurrency(stats.netProfit);
        document.getElementById('summary-profit-rate').textContent = dataManager.formatPercentage(stats.averageProfitRate);
    }

    // Show message
    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of main content
        const main = document.querySelector('main');
        main.insertBefore(messageDiv, main.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Initialize dashboard
    async initialize() {
        await dataManager.loadData();
        this.renderProductList();
        this.updateSummaryStats();
    }
}

// Create global dashboard instance
const dashboard = new Dashboard(); 