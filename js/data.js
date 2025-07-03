// Data management module
class DataManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            month: '',
            brand: ''
        };
    }

    // Load data from JSON file
    async loadData() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            this.products = this.flattenProducts(data);
            this.filteredProducts = [...this.products];
            this.updateBrandFilter();
            return this.products;
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    }

    // Flatten nested product structure
    flattenProducts(brandData) {
        const flattened = [];
        brandData.forEach(brand => {
            brand.products.forEach(product => {
                flattened.push({
                    ...product,
                    brand: brand.brand
                });
            });
        });
        return flattened;
    }

    // Update brand filter options
    updateBrandFilter() {
        const brands = [...new Set(this.products.map(p => p.brand))];
        const brandFilter = document.getElementById('brand-filter');
        
        // Clear existing options except "전체"
        brandFilter.innerHTML = '<option value="">전체</option>';
        
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Apply filters
    applyFilters(month = '', brand = '') {
        this.currentFilters = { month, brand };
        
        this.filteredProducts = this.products.filter(product => {
            const monthMatch = !month || product.month === month;
            const brandMatch = !brand || product.brand === brand;
            return monthMatch && brandMatch;
        });

        return this.filteredProducts;
    }

    // Get filtered products
    getFilteredProducts() {
        return this.filteredProducts;
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Add new product
    addProduct(productData) {
        const newProduct = {
            id: 'p' + (this.products.length + 1),
            ...productData
        };
        
        this.products.push(newProduct);
        this.applyFilters(this.currentFilters.month, this.currentFilters.brand);
        this.updateBrandFilter();
        
        return newProduct;
    }

    // Update existing product
    updateProduct(productId, productData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...productData };
            this.applyFilters(this.currentFilters.month, this.currentFilters.brand);
            return this.products[index];
        }
        return null;
    }

    // Delete product
    deleteProduct(productId) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products.splice(index, 1);
            this.applyFilters(this.currentFilters.month, this.currentFilters.brand);
            this.updateBrandFilter();
            return true;
        }
        return false;
    }

    // Get product by ID
    getProductById(productId) {
        return this.products.find(p => p.id === productId);
    }

    // Calculate product metrics
    calculateProductMetrics(product) {
        const totalRevenue = product.price * product.quantity;
        const totalCost = (product.cost * product.quantity) + product.marketing + product.sales + product.etc;
        const netProfit = totalRevenue - totalCost;
        const profitRate = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            netProfit,
            profitRate
        };
    }

    // Get summary statistics
    getSummaryStats() {
        const products = this.filteredProducts;
        
        if (products.length === 0) {
            return {
                totalRevenue: 0,
                totalCost: 0,
                netProfit: 0,
                averageProfitRate: 0
            };
        }

        const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalCost = products.reduce((sum, p) => {
            return sum + (p.cost * p.quantity) + p.marketing + p.sales + p.etc;
        }, 0);
        const netProfit = totalRevenue - totalCost;
        const averageProfitRate = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            netProfit,
            averageProfitRate
        };
    }

    // Get chart data for profit bar chart
    getProfitChartData() {
        const products = this.filteredProducts;
        
        return products.map(product => {
            const metrics = this.calculateProductMetrics(product);
            return {
                name: product.name,
                totalRevenue: metrics.totalRevenue,
                totalCost: metrics.totalCost,
                netProfit: metrics.netProfit
            };
        });
    }

    // Get chart data for cost pie chart
    getCostChartData() {
        const products = this.filteredProducts;
        
        if (products.length === 0) {
            return {
                labels: ['데이터 없음'],
                data: [1],
                backgroundColor: ['#e5e7eb']
            };
        }

        const totalProductCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
        const totalMarketing = products.reduce((sum, p) => sum + p.marketing, 0);
        const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
        const totalEtc = products.reduce((sum, p) => sum + p.etc, 0);

        return {
            labels: ['제품원가', '마케팅비', '영업비', '기타비용'],
            data: [totalProductCost, totalMarketing, totalSales, totalEtc],
            backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981']
        };
    }

    // Format number to Korean currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    // Format percentage
    formatPercentage(value) {
        return value.toFixed(1) + '%';
    }
}

// Create global data manager instance
const dataManager = new DataManager(); 