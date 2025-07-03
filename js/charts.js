// Chart management module
class ChartManager {
    constructor() {
        this.profitBarChart = null;
        this.costPieChart = null;
        this.initializeCharts();
    }

    // Initialize charts
    initializeCharts() {
        this.createProfitBarChart();
        this.createCostPieChart();
    }

    // Create profit bar chart
    createProfitBarChart() {
        const ctx = document.getElementById('profit-bar-chart');
        if (!ctx) return;

        const chartData = this.getProfitBarChartData();

        this.profitBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: '총매출',
                        data: chartData.revenue,
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '총비용',
                        data: chartData.cost,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '순이익',
                        data: chartData.profit,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '제품별 손익 구조',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 8
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return context.dataset.label + ': ' + new Intl.NumberFormat('ko-KR').format(value) + '원';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ko-KR').format(value) + '원';
                            }
                        }
                    }
                }
            }
        });
    }

    // Create cost pie chart
    createCostPieChart() {
        const ctx = document.getElementById('cost-pie-chart');
        if (!ctx) return;

        const chartData = this.getCostPieChartData();

        this.costPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.data,
                    backgroundColor: chartData.backgroundColor,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '비용 구성 비율',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 6
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ' + new Intl.NumberFormat('ko-KR').format(value) + '원 (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Get profit bar chart data
    getProfitBarChartData() {
        const products = dataManager.getFilteredProducts();
        
        if (products.length === 0) {
            return {
                labels: ['데이터 없음'],
                revenue: [0],
                cost: [0],
                profit: [0]
            };
        }

        const labels = products.map(p => p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name);
        const revenue = products.map(p => p.price * p.quantity);
        const cost = products.map(p => (p.cost * p.quantity) + p.marketing + p.sales + p.etc);
        const profit = products.map((p, i) => revenue[i] - cost[i]);

        return { labels, revenue, cost, profit };
    }

    // Get cost pie chart data
    getCostPieChartData() {
        return dataManager.getCostPieChartData();
    }

    // Update charts
    updateCharts() {
        this.updateProfitBarChart();
        this.updateCostPieChart();
    }

    // Update profit bar chart
    updateProfitBarChart() {
        if (!this.profitBarChart) return;

        const chartData = this.getProfitBarChartData();
        
        this.profitBarChart.data.labels = chartData.labels;
        this.profitBarChart.data.datasets[0].data = chartData.revenue;
        this.profitBarChart.data.datasets[1].data = chartData.cost;
        this.profitBarChart.data.datasets[2].data = chartData.profit;
        
        this.profitBarChart.update();
    }

    // Update cost pie chart
    updateCostPieChart() {
        if (!this.costPieChart) return;

        const chartData = this.getCostPieChartData();
        
        this.costPieChart.data.labels = chartData.labels;
        this.costPieChart.data.datasets[0].data = chartData.data;
        this.costPieChart.data.datasets[0].backgroundColor = chartData.backgroundColor;
        
        this.costPieChart.update();
    }

    // Destroy charts (for cleanup)
    destroyCharts() {
        if (this.profitBarChart) {
            this.profitBarChart.destroy();
            this.profitBarChart = null;
        }
        if (this.costPieChart) {
            this.costPieChart.destroy();
            this.costPieChart = null;
        }
    }

    // Recreate charts (for tab switching)
    recreateCharts() {
        this.destroyCharts();
        this.initializeCharts();
    }
}

// Create global chart manager instance
window.chartManager = new ChartManager(); 