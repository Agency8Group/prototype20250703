# 개발 가이드 - 제품별 손익구조 분석 대시보드 v2.0

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처 설계](#아키텍처-설계)
3. [모듈별 상세 설명](#모듈별-상세-설명)
4. [데이터 플로우](#데이터-플로우)
5. [확장 가이드](#확장-가이드)
6. [디버깅 가이드](#디버깅-가이드)
7. [성능 최적화](#성능-최적화)

## 🎯 프로젝트 개요

### 목적

-   제품별 손익구조를 실시간으로 분석하고 시각화
-   유통채널별, 브랜드별, 월별 필터링 지원
-   재고 관리 및 정산 정보 통합 관리
-   확장 가능한 모듈화된 구조

### 기술 스택

-   **Frontend**: Vanilla JavaScript (ES6+)
-   **Styling**: Tailwind CSS
-   **Charts**: Chart.js
-   **Architecture**: Class-based modular architecture

## 🏗 아키텍처 설계

### 전체 구조

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   index.html    │    │   main.js       │    │   dashboard.js  │
│   (UI Layer)    │◄──►│   (App Core)    │◄──►│   (UI Logic)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   style.css     │    │   data.js       │    │   charts.js     │
│   (Styling)     │    │   (Data Layer)  │    │   (Charts)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ products.json   │
                       │ (Data Source)   │
                       └─────────────────┘
```

### 모듈 의존성

```
main.js (App)
├── data.js (DataManager)
├── dashboard.js (Dashboard)
└── charts.js (ChartManager)

dashboard.js (Dashboard)
├── data.js (DataManager)
└── charts.js (ChartManager)

charts.js (ChartManager)
└── data.js (DataManager)
```

## 📦 모듈별 상세 설명

### 1. DataManager (data.js)

#### 주요 클래스

```javascript
class DataManager {
    constructor() {
        this.products = []; // 전체 제품 데이터
        this.filteredProducts = []; // 필터링된 제품 데이터
        this.currentFilters = {}; // 현재 적용된 필터
    }
}
```

#### 핵심 메서드

-   `loadData()`: JSON 파일에서 데이터 로드
-   `applyFilters()`: 월/브랜드/채널별 필터링
-   `calculateProductMetrics()`: 제품별 손익 계산
-   `getChannelAnalysis()`: 채널별 분석 데이터
-   `getLowStockProducts()`: 재고 부족 제품 조회

#### 데이터 구조

```javascript
{
    id: "p1",
    brand: "브랜드A",
    name: "제품명",
    channel: "G마켓",
    price: 150000,
    cost: 80000,
    quantity: 50,
    commissionRate: 5.0,
    stock: 15,
    reorderDate: "2024-07-15",
    settlementAmount: 142500,
    settlementDate: "2024-07-10",
    marketing: 2000000,
    sales: 500000,
    etc: 300000,
    month: "2024-06"
}
```

### 2. Dashboard (dashboard.js)

#### 주요 클래스

```javascript
class Dashboard {
    constructor() {
        this.currentEditId = null; // 현재 편집 중인 제품 ID
        this.initializeEventListeners();
    }
}
```

#### 핵심 메서드

-   `initializeEventListeners()`: 이벤트 리스너 등록
-   `showProductForm()`: 제품 입력 폼 표시
-   `handleFormSubmit()`: 폼 제출 처리
-   `renderProductList()`: 제품 리스트 렌더링
-   `updateCalculations()`: 실시간 계산 업데이트

#### 이벤트 시스템

```javascript
// 실시간 계산 이벤트
calculationInputs.forEach((inputId) => {
    document.getElementById(inputId).addEventListener("input", () => {
        this.updateCalculations();
    });
});

// 필터 적용 이벤트
document.getElementById("apply-filter").addEventListener("click", () => {
    this.applyFilters();
});
```

### 3. ChartManager (charts.js)

#### 주요 클래스

```javascript
class ChartManager {
    constructor() {
        this.profitBarChart = null; // 손익 막대그래프
        this.costPieChart = null; // 비용 파이차트
        this.initializeCharts();
    }
}
```

#### 핵심 메서드

-   `createProfitBarChart()`: 손익 막대그래프 생성
-   `createCostPieChart()`: 비용 파이차트 생성
-   `updateCharts()`: 차트 데이터 업데이트
-   `recreateCharts()`: 차트 재생성 (탭 전환 시)

#### 차트 옵션

```javascript
// 반응형 설정
responsive: true,
maintainAspectRatio: false,

// 한국어 통화 포맷팅
tooltip: {
    callbacks: {
        label: function(context) {
            return context.dataset.label + ': ' +
                   new Intl.NumberFormat('ko-KR').format(value) + '원';
        }
    }
}
```

### 4. App (main.js)

#### 주요 클래스

```javascript
class App {
    constructor() {
        this.currentTab = "admin"; // 현재 활성 탭
        this.initializeEventListeners();
    }
}
```

#### 핵심 메서드

-   `switchTab()`: 탭 전환 처리
-   `initialize()`: 애플리케이션 초기화
-   `showLoading()`: 로딩 상태 표시
-   `exportData()`: 데이터 내보내기

## 🔄 데이터 플로우

### 1. 초기화 플로우

```
App.initialize()
    ↓
DataManager.loadData()
    ↓
Dashboard.initialize()
    ↓
Dashboard.renderProductList()
    ↓
Dashboard.updateSummaryStats()
    ↓
Dashboard.updateChannelAnalysis()
```

### 2. 필터 적용 플로우

```
User clicks "필터 적용"
    ↓
Dashboard.applyFilters()
    ↓
DataManager.applyFilters()
    ↓
Dashboard.renderProductList()
    ↓
Dashboard.updateSummaryStats()
    ↓
Dashboard.updateChannelAnalysis()
    ↓
ChartManager.updateCharts() (if preview tab)
```

### 3. 제품 추가/수정 플로우

```
User submits form
    ↓
Dashboard.handleFormSubmit()
    ↓
DataManager.addProduct() / updateProduct()
    ↓
Dashboard.renderProductList()
    ↓
Dashboard.updateSummaryStats()
    ↓
Dashboard.updateChannelAnalysis()
    ↓
ChartManager.updateCharts() (if preview tab)
```

## 🔧 확장 가이드

### 1. 새로운 필드 추가

#### Step 1: 데이터 구조 확장

```javascript
// data/products.json에 필드 추가
{
    "newField": "새로운 값"
}
```

#### Step 2: DataManager 업데이트

```javascript
// data.js의 calculateProductMetrics 메서드 수정
calculateProductMetrics(product) {
    // 새로운 필드 계산 로직 추가
    const newCalculation = product.newField * someFactor;

    return {
        // 기존 계산 결과
        totalRevenue,
        totalCost,
        netProfit,
        profitRate,
        // 새로운 계산 결과
        newCalculation
    };
}
```

#### Step 3: Dashboard 업데이트

```javascript
// dashboard.js의 getFormData 메서드 수정
getFormData() {
    return {
        // 기존 필드들
        brand: document.getElementById('brand-input').value,
        // 새로운 필드
        newField: document.getElementById('new-field-input').value
    };
}

// populateForm 메서드 수정
populateForm(product) {
    // 기존 필드들
    document.getElementById('brand-input').value = product.brand;
    // 새로운 필드
    document.getElementById('new-field-input').value = product.newField;
}
```

#### Step 4: HTML 업데이트

```html
<!-- index.html에 폼 필드 추가 -->
<div>
    <label class="block text-sm font-medium text-gray-700 mb-2"
        >새로운 필드</label
    >
    <input
        type="text"
        id="new-field-input"
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
    />
</div>

<!-- 테이블 헤더 추가 -->
<th
    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
>
    새로운 필드
</th>
```

### 2. 새로운 차트 추가

#### Step 1: ChartManager에 차트 클래스 추가

```javascript
// charts.js에 새로운 차트 메서드 추가
createNewChart() {
    const ctx = document.getElementById('new-chart');
    if (!ctx) return;

    this.newChart = new Chart(ctx, {
        type: 'line', // 또는 다른 차트 타입
        data: this.getNewChartData(),
        options: {
            // 차트 옵션 설정
        }
    });
}

getNewChartData() {
    const products = dataManager.getFilteredProducts();
    // 차트 데이터 처리 로직
    return {
        labels: [],
        datasets: []
    };
}
```

#### Step 2: HTML에 차트 컨테이너 추가

```html
<!-- index.html에 차트 컨테이너 추가 -->
<div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">새로운 차트</h3>
    <div class="h-80">
        <canvas id="new-chart"></canvas>
    </div>
</div>
```

#### Step 3: Dashboard에서 차트 업데이트 연결

```javascript
// dashboard.js의 applyFilters 메서드 수정
applyFilters() {
    // 기존 로직
    dataManager.applyFilters(month, brand, channel);
    this.renderProductList();
    this.updateSummaryStats();

    // 새로운 차트 업데이트
    if (document.getElementById('preview-content').classList.contains('hidden') === false) {
        window.chartManager.updateCharts();
        window.chartManager.updateNewChart(); // 새로운 차트 업데이트
    }
}
```

### 3. 새로운 필터 추가

#### Step 1: DataManager에 필터 로직 추가

```javascript
// data.js의 applyFilters 메서드 수정
applyFilters(month = '', brand = '', channel = '', newFilter = '') {
    this.currentFilters = { month, brand, channel, newFilter };

    this.filteredProducts = this.products.filter(product => {
        const monthMatch = !month || product.month === month;
        const brandMatch = !brand || product.brand === brand;
        const channelMatch = !channel || product.channel === channel;
        const newFilterMatch = !newFilter || product.someField === newFilter;

        return monthMatch && brandMatch && channelMatch && newFilterMatch;
    });

    return this.filteredProducts;
}
```

#### Step 2: HTML에 필터 UI 추가

```html
<!-- index.html에 필터 추가 -->
<div>
    <label class="block text-sm font-medium text-gray-700 mb-2"
        >새로운 필터</label
    >
    <select
        id="new-filter"
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
    >
        <option value="">전체</option>
        <!-- 옵션들 -->
    </select>
</div>
```

#### Step 3: Dashboard에서 필터 처리 추가

```javascript
// dashboard.js의 applyFilters 메서드 수정
applyFilters() {
    const month = document.getElementById('month-filter').value;
    const brand = document.getElementById('brand-filter').value;
    const channel = document.getElementById('channel-filter').value;
    const newFilter = document.getElementById('new-filter').value; // 새로운 필터

    dataManager.applyFilters(month, brand, channel, newFilter);
    // 나머지 로직...
}
```

## 🐛 디버깅 가이드

### 1. 일반적인 문제 해결

#### 데이터 로딩 실패

```javascript
// 브라우저 콘솔에서 확인
console.log("DataManager products:", dataManager.products);
console.log("Filtered products:", dataManager.filteredProducts);
```

#### 차트 표시 안됨

```javascript
// 차트 객체 확인
console.log("Profit chart:", window.chartManager.profitBarChart);
console.log("Cost chart:", window.chartManager.costPieChart);
```

#### 계산 오류

```javascript
// 계산 결과 확인
const testProduct = dataManager.products[0];
const metrics = dataManager.calculateProductMetrics(testProduct);
console.log("Test product metrics:", metrics);
```

### 2. 개발자 도구 활용

#### 네트워크 탭

-   `data/products.json` 파일 로딩 상태 확인
-   CDN 라이브러리 로딩 상태 확인

#### 콘솔 탭

-   JavaScript 오류 확인
-   데이터 상태 로깅

#### Elements 탭

-   HTML 구조 확인
-   CSS 클래스 적용 상태 확인

### 3. 로깅 시스템

#### 디버그 모드 활성화

```javascript
// 브라우저 콘솔에서 실행
window.DEBUG_MODE = true;

// 로깅 함수 추가
function debugLog(message, data) {
    if (window.DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, data);
    }
}
```

## ⚡ 성능 최적화

### 1. 데이터 최적화

#### 대용량 데이터 처리

```javascript
// 페이지네이션 구현
class DataManager {
    constructor() {
        this.pageSize = 50;
        this.currentPage = 1;
    }

    getPaginatedProducts() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredProducts.slice(start, end);
    }
}
```

#### 메모리 최적화

```javascript
// 불필요한 데이터 정리
class DataManager {
    cleanup() {
        this.filteredProducts = null;
        // 가비지 컬렉션 유도
    }
}
```

### 2. 렌더링 최적화

#### 가상 스크롤링

```javascript
// 대용량 테이블 최적화
class Dashboard {
    renderVirtualTable() {
        const visibleRows = this.getVisibleRows();
        this.renderOnlyVisibleRows(visibleRows);
    }
}
```

#### 디바운싱

```javascript
// 실시간 계산 최적화
class Dashboard {
    constructor() {
        this.calculationTimeout = null;
    }

    updateCalculations() {
        clearTimeout(this.calculationTimeout);
        this.calculationTimeout = setTimeout(() => {
            this.performCalculation();
        }, 300);
    }
}
```

### 3. 차트 최적화

#### 차트 업데이트 최적화

```javascript
// 불필요한 차트 업데이트 방지
class ChartManager {
    updateCharts() {
        if (this.chartsNeedUpdate) {
            this.updateProfitBarChart();
            this.updateCostPieChart();
            this.chartsNeedUpdate = false;
        }
    }
}
```

## 📝 코딩 컨벤션

### 1. 네이밍 컨벤션

-   **클래스**: PascalCase (예: `DataManager`)
-   **메서드**: camelCase (예: `calculateProductMetrics`)
-   **변수**: camelCase (예: `totalRevenue`)
-   **상수**: UPPER_SNAKE_CASE (예: `DEFAULT_PAGE_SIZE`)

### 2. 파일 구조

-   **HTML**: `index.html` (메인 UI)
-   **CSS**: `css/style.css` (커스텀 스타일)
-   **JavaScript**: `js/` 디렉토리 내 모듈별 분리
-   **데이터**: `data/` 디렉토리 내 JSON 파일

### 3. 주석 규칙

```javascript
/**
 * 제품별 손익 계산
 * @param {Object} product - 제품 데이터
 * @returns {Object} 계산된 손익 정보
 */
calculateProductMetrics(product) {
    // 계산 로직
}
```

## 🚀 배포 체크리스트

### 1. 코드 품질

-   [ ] 모든 기능 테스트 완료
-   [ ] 오류 처리 구현
-   [ ] 성능 최적화 적용
-   [ ] 브라우저 호환성 확인

### 2. 파일 정리

-   [ ] 불필요한 파일 제거
-   [ ] 파일 경로 확인
-   [ ] CDN 링크 유효성 확인
-   [ ] 데이터 파일 최신화

### 3. 문서화

-   [ ] README.md 업데이트
-   [ ] 개발 가이드 작성
-   [ ] API 문서 작성 (필요시)
-   [ ] 변경 이력 기록

---

**작성자**: AI Assistant  
**버전**: 2.0.0  
**최종 업데이트**: 2024년 12월
