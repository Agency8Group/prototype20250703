// Data management module
class DataManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            month: '',
            brand: '',
            channel: ''
        };
    }

    // Load data from JSON file
    async loadData() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            this.products = this.flattenProducts(data);
            this.filteredProducts = [...this.products];
            this.updateFilters();
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

    // Update filter options
    updateFilters() {
        this.updateBrandFilter();
        this.updateChannelFilter();
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

    // Update channel filter options
    updateChannelFilter() {
        const channels = [...new Set(this.products.map(p => p.channel))];
        const channelFilter = document.getElementById('channel-filter');
        
        // Clear existing options except "전체"
        channelFilter.innerHTML = '<option value="">전체</option>';
        
        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel;
            option.textContent = channel;
            channelFilter.appendChild(option);
        });
    }

    // Apply filters
    applyFilters(month = '', brand = '', channel = '') {
        this.currentFilters = { month, brand, channel };
        
        this.filteredProducts = this.products.filter(product => {
            const monthMatch = !month || product.month === month;
            const brandMatch = !brand || product.brand === brand;
            const channelMatch = !channel || product.channel === channel;
            return monthMatch && brandMatch && channelMatch;
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
        this.applyFilters(this.currentFilters.month, this.currentFilters.brand, this.currentFilters.channel);
        this.updateFilters();
        
        return newProduct;
    }

    // Update existing product
    updateProduct(productId, productData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...productData };
            this.applyFilters(this.currentFilters.month, this.currentFilters.brand, this.currentFilters.channel);
            return this.products[index];
        }
        return null;
    }

    // Delete product
    deleteProduct(productId) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products.splice(index, 1);
            this.applyFilters(this.currentFilters.month, this.currentFilters.brand, this.currentFilters.channel);
            this.updateFilters();
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
        const commissionAmount = totalRevenue * (product.commissionRate / 100);
        const totalCost = (product.cost * product.quantity) + product.marketing + product.sales + product.etc;
        const netProfit = totalRevenue - totalCost - commissionAmount;
        const profitRate = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            commissionAmount,
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
                totalCommission: 0,
                netProfit: 0,
                averageProfitRate: 0
            };
        }

        const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalCost = products.reduce((sum, p) => {
            return sum + (p.cost * p.quantity) + p.marketing + p.sales + p.etc;
        }, 0);
        const totalCommission = products.reduce((sum, p) => {
            return sum + ((p.price * p.quantity) * (p.commissionRate / 100));
        }, 0);
        const netProfit = totalRevenue - totalCost - totalCommission;
        const averageProfitRate = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            totalCommission,
            netProfit,
            averageProfitRate
        };
    }

    // Get channel analysis
    getChannelAnalysis() {
        const products = this.filteredProducts;
        const channelStats = {};
        
        products.forEach(product => {
            const channel = product.channel;
            const revenue = product.price * product.quantity;
            
            if (!channelStats[channel]) {
                channelStats[channel] = {
                    revenue: 0,
                    quantity: 0,
                    products: 0
                };
            }
            
            channelStats[channel].revenue += revenue;
            channelStats[channel].quantity += product.quantity;
            channelStats[channel].products += 1;
        });

        return channelStats;
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
    getCostPieChartData() {
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
        const totalCommission = products.reduce((sum, p) => {
            return sum + ((p.price * p.quantity) * (p.commissionRate / 100));
        }, 0);

        // Only show categories with values > 0
        const data = [];
        const labels = [];
        const backgroundColor = [];

        if (totalProductCost > 0) {
            data.push(totalProductCost);
            labels.push('제품원가');
            backgroundColor.push('#3b82f6');
        }

        if (totalMarketing > 0) {
            data.push(totalMarketing);
            labels.push('마케팅비');
            backgroundColor.push('#ef4444');
        }

        if (totalSales > 0) {
            data.push(totalSales);
            labels.push('영업비');
            backgroundColor.push('#f59e0b');
        }

        if (totalCommission > 0) {
            data.push(totalCommission);
            labels.push('수수료');
            backgroundColor.push('#8b5cf6');
        }

        if (totalEtc > 0) {
            data.push(totalEtc);
            labels.push('기타비용');
            backgroundColor.push('#10b981');
        }

        return { labels, data, backgroundColor };
    }

    // Get low stock products (재고 부족 제품)
    getLowStockProducts(threshold = 10) {
        return this.products.filter(product => product.stock <= threshold);
    }

    // Get upcoming reorder products (리오더 예정 제품)
    getUpcomingReorderProducts(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return this.products.filter(product => {
            if (!product.reorderDate) return false;
            const reorderDate = new Date(product.reorderDate);
            return reorderDate <= futureDate;
        });
    }

    // Format number to Korean currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    // Format percentage
    formatPercentage(value) {
        return value.toFixed(1) + '%';
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    }
}

// Create global data manager instance
const dataManager = new DataManager(); 