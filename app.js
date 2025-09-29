// EDA Pro - Comprehensive Data Analysis Tool
class EDAProApp {
    constructor() {
        this.currentData = null;
        this.originalData = null;
        this.currentChart = null;
        this.correlationChart = null;
        this.outlierIndices = [];
        
        this.sampleDatasets = {
            titanic: {
                name: "Titanic Dataset",
                data: this.generateTitanicData()
            },
            housing: {
                name: "California Housing",
                data: this.generateHousingData()
            },
            sales: {
                name: "Retail Sales",
                data: this.generateSalesData()
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupFileUpload();
        this.setupThemeToggle();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                this.updateActiveNav(link);
            });
        });

        // Sample data loading
        document.getElementById('loadSampleData').addEventListener('click', () => {
            this.showSection('upload');
        });

        document.querySelectorAll('.sample-card').forEach(card => {
            card.addEventListener('click', () => {
                const dataset = card.dataset.dataset;
                this.loadSampleDataset(dataset);
            });
        });

        // Visualization controls
        document.getElementById('generateChart').addEventListener('click', () => {
            this.generateVisualization();
        });

        // Chart type change handler
        document.getElementById('chartType').addEventListener('change', () => {
            this.updateChartTypeControls();
        });

        // Statistics
        document.getElementById('calculateCorrelation').addEventListener('click', () => {
            this.calculateCorrelation();
        });

        // Data cleaning
        document.getElementById('handleMissing').addEventListener('click', () => {
            this.handleMissingValues();
        });
        
        document.getElementById('detectOutliers').addEventListener('click', () => {
            this.detectOutliers();
        });
        
        document.getElementById('removeOutliers').addEventListener('click', () => {
            this.removeOutliers();
        });
        
        document.getElementById('detectDuplicates').addEventListener('click', () => {
            this.detectDuplicates();
        });
        
        document.getElementById('removeDuplicates').addEventListener('click', () => {
            this.removeDuplicates();
        });

        // Feature engineering
        document.getElementById('applyScaling').addEventListener('click', () => {
            this.applyScaling();
        });
        
        document.getElementById('applyTransform').addEventListener('click', () => {
            this.applyTransformation();
        });

        // Export
        document.getElementById('downloadCSV').addEventListener('click', () => {
            this.downloadCSV();
        });
        
        document.getElementById('generateReport').addEventListener('click', () => {
            this.generateReport();
        });
        
        document.getElementById('exportCharts').addEventListener('click', () => {
            this.exportCharts();
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        // Click outside modal to close
        document.getElementById('resultModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setupNavigation() {
        // Make navigation functions globally accessible
        window.showSection = (sectionName) => this.showSection(sectionName);
    }

    setupFileUpload() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');

        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            this.handleFileUpload(files);
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', currentTheme);
        themeToggle.textContent = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('theme', newTheme);
        document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('resultModal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('resultModal').classList.add('hidden');
    }

    // File Upload Handler
    async handleFileUpload(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        const uploadStatus = document.getElementById('uploadStatus');
        
        try {
            this.showLoading();
            
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let data;
            
            if (fileExtension === 'csv') {
                data = await this.parseCSV(file);
            } else if (fileExtension === 'xlsx') {
                this.showAlert('Excel files are not fully supported in this demo. Please use CSV format.', 'warning');
                this.hideLoading();
                return;
            } else if (fileExtension === 'json') {
                data = await this.parseJSON(file);
            } else {
                throw new Error('Unsupported file format');
            }
            
            this.currentData = data;
            this.originalData = JSON.parse(JSON.stringify(data)); // Deep copy
            
            uploadStatus.innerHTML = `
                <div class="alert alert--success">
                    <strong>File uploaded successfully!</strong><br>
                    Loaded ${data.length} rows and ${Object.keys(data[0]).length} columns from ${file.name}
                </div>
            `;
            uploadStatus.classList.remove('hidden');
            
            this.updateDataOverview();
            this.updateColumnSelectors();
            this.showSection('overview');
            
        } catch (error) {
            uploadStatus.innerHTML = `
                <div class="alert alert--error">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
            uploadStatus.classList.remove('hidden');
        } finally {
            this.hideLoading();
        }
    }

    parseCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error('Error parsing CSV: ' + results.errors[0].message));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    parseJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        resolve(data);
                    } else {
                        reject(new Error('JSON must be an array of objects'));
                    }
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    // Sample Data Generation
    generateTitanicData() {
        const data = [];
        const names = ['John Smith', 'Mary Johnson', 'James Wilson', 'Patricia Brown', 'Robert Jones'];
        const classes = [1, 2, 3];
        const sexes = ['male', 'female'];
        const embarked = ['C', 'Q', 'S'];
        
        for (let i = 1; i <= 100; i++) {
            data.push({
                PassengerId: i,
                Survived: Math.random() > 0.6 ? 1 : 0,
                Pclass: classes[Math.floor(Math.random() * classes.length)],
                Name: names[Math.floor(Math.random() * names.length)],
                Sex: sexes[Math.floor(Math.random() * sexes.length)],
                Age: Math.random() > 0.25 ? Math.floor(Math.random() * 70 + 5) : null,
                SibSp: Math.floor(Math.random() * 4),
                Parch: Math.floor(Math.random() * 3),
                Ticket: 'A' + Math.floor(Math.random() * 100000),
                Fare: Math.random() * 200 + 10,
                Cabin: Math.random() > 0.7 ? 'C' + Math.floor(Math.random() * 100) : null,
                Embarked: embarked[Math.floor(Math.random() * embarked.length)]
            });
        }
        return data;
    }

    generateHousingData() {
        const data = [];
        const proximities = ['NEAR BAY', 'NEAR OCEAN', '1H OCEAN', 'INLAND', 'ISLAND'];
        
        for (let i = 0; i < 200; i++) {
            data.push({
                longitude: -122.5 + Math.random() * 5,
                latitude: 34.0 + Math.random() * 4,
                housing_median_age: Math.floor(Math.random() * 50 + 1),
                total_rooms: Math.floor(Math.random() * 8000 + 500),
                total_bedrooms: Math.floor(Math.random() * 1500 + 100),
                population: Math.floor(Math.random() * 6000 + 500),
                households: Math.floor(Math.random() * 1500 + 100),
                median_income: Math.random() * 12 + 1,
                median_house_value: Math.floor(Math.random() * 400000 + 100000),
                ocean_proximity: proximities[Math.floor(Math.random() * proximities.length)]
            });
        }
        return data;
    }

    generateSalesData() {
        const data = [];
        const stores = ['Store A', 'Store B', 'Store C'];
        const products = ['Product 1', 'Product 2', 'Product 3', 'Product 4'];
        
        for (let i = 0; i < 150; i++) {
            const date = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28 + 1));
            data.push({
                Date: date.toISOString().split('T')[0],
                Store: stores[Math.floor(Math.random() * stores.length)],
                Product: products[Math.floor(Math.random() * products.length)],
                Sales: Math.floor(Math.random() * 10000 + 1000),
                Customers: Math.floor(Math.random() * 500 + 50),
                Promotion: Math.random() > 0.7 ? 'Yes' : 'No',
                Holiday: Math.random() > 0.9 ? 'Yes' : 'No'
            });
        }
        return data;
    }

    loadSampleDataset(datasetKey) {
        this.showLoading();
        
        setTimeout(() => {
            const dataset = this.sampleDatasets[datasetKey];
            this.currentData = dataset.data;
            this.originalData = JSON.parse(JSON.stringify(dataset.data));
            
            const uploadStatus = document.getElementById('uploadStatus');
            uploadStatus.innerHTML = `
                <div class="alert alert--success">
                    <strong>Sample dataset loaded!</strong><br>
                    ${dataset.name} - ${dataset.data.length} rows and ${Object.keys(dataset.data[0]).length} columns
                </div>
            `;
            uploadStatus.classList.remove('hidden');
            
            this.updateDataOverview();
            this.updateColumnSelectors();
            this.showSection('overview');
            this.hideLoading();
        }, 500);
    }

    // Data Overview
    updateDataOverview() {
        if (!this.currentData) return;
        
        const overview = document.getElementById('dataOverview');
        const columns = Object.keys(this.currentData[0]);
        const numericColumns = this.getNumericColumns();
        const categoricalColumns = this.getCategoricalColumns();
        const missingValues = this.countMissingValues();
        
        overview.innerHTML = `
            <div class="overview-stats">
                <div class="stat-item">
                    <span class="stat-value">${this.currentData.length}</span>
                    <span class="stat-label">Rows</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${columns.length}</span>
                    <span class="stat-label">Columns</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${numericColumns.length}</span>
                    <span class="stat-label">Numeric</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${categoricalColumns.length}</span>
                    <span class="stat-label">Categorical</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${Object.values(missingValues).reduce((a, b) => a + b, 0)}</span>
                    <span class="stat-label">Missing Values</span>
                </div>
            </div>
            <div class="data-table-container">
                <h3>Data Preview</h3>
                ${this.generateDataTable(this.currentData.slice(0, 10))}
            </div>
        `;
        
        this.generateStatisticsOverview();
    }

    generateDataTable(data) {
        if (!data || data.length === 0) return '<p class="no-data-message">No data to display</p>';
        
        const columns = Object.keys(data[0]);
        let html = '<table class="data-table"><thead><tr>';
        
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col];
                html += `<td>${value !== null && value !== undefined ? value : '<em>null</em>'}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        return html;
    }

    generateStatisticsOverview() {
        if (!this.currentData) return;
        
        const numericColumns = this.getNumericColumns();
        const statisticsContent = document.getElementById('statisticsContent');
        
        if (numericColumns.length === 0) {
            statisticsContent.innerHTML = '<p class="no-data-message">No numeric columns found for statistical analysis.</p>';
            return;
        }
        
        let html = '<h2>Descriptive Statistics</h2>';
        html += '<table class="stats-table"><thead><tr>';
        html += '<th>Column</th><th>Count</th><th>Mean</th><th>Std</th><th>Min</th><th>25%</th><th>50%</th><th>75%</th><th>Max</th>';
        html += '</tr></thead><tbody>';
        
        numericColumns.forEach(column => {
            const values = this.currentData
                .map(row => row[column])
                .filter(val => val !== null && val !== undefined && !isNaN(val));
            
            if (values.length > 0) {
                const stats = this.calculateDescriptiveStats(values);
                html += `<tr>
                    <td><strong>${column}</strong></td>
                    <td>${stats.count}</td>
                    <td>${stats.mean.toFixed(2)}</td>
                    <td>${stats.std.toFixed(2)}</td>
                    <td>${stats.min.toFixed(2)}</td>
                    <td>${stats.q25.toFixed(2)}</td>
                    <td>${stats.median.toFixed(2)}</td>
                    <td>${stats.q75.toFixed(2)}</td>
                    <td>${stats.max.toFixed(2)}</td>
                </tr>`;
            }
        });
        
        html += '</tbody></table>';
        statisticsContent.innerHTML = html;
    }

    calculateDescriptiveStats(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        const std = Math.sqrt(variance);
        
        return {
            count: n,
            mean: mean,
            std: std,
            min: sorted[0],
            q25: this.percentile(sorted, 0.25),
            median: this.percentile(sorted, 0.5),
            q75: this.percentile(sorted, 0.75),
            max: sorted[n - 1]
        };
    }

    percentile(sorted, p) {
        const index = p * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sorted.length) return sorted[sorted.length - 1];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    // Visualization - Fixed column selector update
    updateColumnSelectors() {
        if (!this.currentData || this.currentData.length === 0) return;
        
        const columns = Object.keys(this.currentData[0]);
        const numericColumns = this.getNumericColumns();
        
        // Get dropdowns
        const xColumn = document.getElementById('xColumn');
        const yColumn = document.getElementById('yColumn');
        const scaleColumn = document.getElementById('scaleColumn');
        const transformColumn = document.getElementById('transformColumn');
        
        // Store current values
        const xCurrentValue = xColumn.value;
        const yCurrentValue = yColumn.value;
        
        // Clear and populate visualization dropdowns
        this.populateSelectOptions(xColumn, columns);
        this.populateSelectOptions(yColumn, columns);
        
        // Restore or set intelligent defaults
        if (columns.includes(xCurrentValue)) {
            xColumn.value = xCurrentValue;
        } else if (numericColumns.length > 0) {
            xColumn.value = numericColumns[0];
        }
        
        if (columns.includes(yCurrentValue)) {
            yColumn.value = yCurrentValue;
        } else if (numericColumns.length > 1) {
            yColumn.value = numericColumns[1];
        } else if (numericColumns.length > 0) {
            yColumn.value = numericColumns[0];
        }
        
        // Clear and populate feature engineering dropdowns
        this.populateSelectOptions(scaleColumn, numericColumns);
        this.populateSelectOptions(transformColumn, numericColumns);
        
        // Update chart type controls
        this.updateChartTypeControls();
    }

    populateSelectOptions(selectElement, options) {
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add placeholder option if needed
        if (options.length === 0) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = 'No options available';
            placeholderOption.disabled = true;
            selectElement.appendChild(placeholderOption);
            return;
        }
        
        // Add all options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    updateChartTypeControls() {
        const chartType = document.getElementById('chartType').value;
        const yColumnGroup = document.querySelector('#yColumn').closest('.control-group');
        
        // Hide Y column selector for single-variable charts
        if (chartType === 'histogram' || chartType === 'box' || chartType === 'bar') {
            yColumnGroup.style.display = 'none';
        } else {
            yColumnGroup.style.display = 'flex';
        }
    }

    generateVisualization() {
        if (!this.currentData) return;
        
        const chartType = document.getElementById('chartType').value;
        const xColumn = document.getElementById('xColumn').value;
        const yColumn = document.getElementById('yColumn').value;
        
        if (!xColumn) {
            this.showAlert('Please select a column for visualization', 'warning');
            return;
        }
        
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        try {
            switch (chartType) {
                case 'histogram':
                    this.createHistogram(ctx, xColumn);
                    break;
                case 'scatter':
                    if (!yColumn) {
                        this.showAlert('Please select both X and Y columns for scatter plot', 'warning');
                        return;
                    }
                    this.createScatterPlot(ctx, xColumn, yColumn);
                    break;
                case 'box':
                    this.createBoxPlot(ctx, xColumn);
                    break;
                case 'bar':
                    this.createBarChart(ctx, xColumn);
                    break;
                case 'line':
                    if (!yColumn) {
                        this.showAlert('Please select both X and Y columns for line chart', 'warning');
                        return;
                    }
                    this.createLineChart(ctx, xColumn, yColumn);
                    break;
                default:
                    this.showAlert('Unknown chart type', 'error');
            }
        } catch (error) {
            this.showAlert(`Error creating visualization: ${error.message}`, 'error');
        }
    }

    createHistogram(ctx, column) {
        const values = this.currentData
            .map(row => row[column])
            .filter(val => val !== null && val !== undefined && !isNaN(val));
        
        if (values.length === 0) {
            this.showAlert('Selected column has no numeric values', 'warning');
            return;
        }
        
        const bins = this.createHistogramBins(values, 20);
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bins.labels,
                datasets: [{
                    label: `Distribution of ${column}`,
                    data: bins.counts,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#13343B',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Histogram: ${column}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frequency'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: column
                        }
                    }
                }
            }
        });
    }

    createScatterPlot(ctx, xColumn, yColumn) {
        const data = this.currentData
            .filter(row => row[xColumn] !== null && row[yColumn] !== null)
            .map(row => ({
                x: row[xColumn],
                y: row[yColumn]
            }));
        
        this.currentChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `${yColumn} vs ${xColumn}`,
                    data: data,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#13343B'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Scatter Plot: ${yColumn} vs ${xColumn}`
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xColumn
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yColumn
                        }
                    }
                }
            }
        });
    }

    createBarChart(ctx, column) {
        const valueCounts = {};
        this.currentData.forEach(row => {
            const value = row[column];
            if (value !== null && value !== undefined) {
                valueCounts[value] = (valueCounts[value] || 0) + 1;
            }
        });
        
        const sortedEntries = Object.entries(valueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Top 20
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedEntries.map(entry => entry[0]),
                datasets: [{
                    label: `Count of ${column}`,
                    data: sortedEntries.map(entry => entry[1]),
                    backgroundColor: '#1FB8CD',
                    borderColor: '#13343B',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Bar Chart: ${column}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: column
                        }
                    }
                }
            }
        });
    }

    createLineChart(ctx, xColumn, yColumn) {
        const data = this.currentData
            .filter(row => row[xColumn] !== null && row[yColumn] !== null)
            .sort((a, b) => a[xColumn] - b[xColumn])
            .map(row => ({
                x: row[xColumn],
                y: row[yColumn]
            }));
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: `${yColumn} over ${xColumn}`,
                    data: data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Line Chart: ${yColumn} over ${xColumn}`
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xColumn
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yColumn
                        }
                    }
                }
            }
        });
    }

    createBoxPlot(ctx, column) {
        // Simplified box plot using bar chart
        const values = this.currentData
            .map(row => row[column])
            .filter(val => val !== null && val !== undefined && !isNaN(val));
        
        if (values.length === 0) {
            this.showAlert('Selected column has no numeric values', 'warning');
            return;
        }
        
        const stats = this.calculateDescriptiveStats(values);
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Min', 'Q1', 'Median', 'Q3', 'Max'],
                datasets: [{
                    label: `Box Plot Statistics for ${column}`,
                    data: [stats.min, stats.q25, stats.median, stats.q75, stats.max],
                    backgroundColor: ['#B4413C', '#FFC185', '#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Box Plot Statistics: ${column}`
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            }
        });
    }

    createHistogramBins(values, numBins) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binWidth = (max - min) / numBins;
        
        const bins = Array(numBins).fill(0);
        const labels = [];
        
        for (let i = 0; i < numBins; i++) {
            const binStart = min + i * binWidth;
            const binEnd = min + (i + 1) * binWidth;
            labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
        }
        
        values.forEach(value => {
            let binIndex = Math.floor((value - min) / binWidth);
            if (binIndex >= numBins) binIndex = numBins - 1;
            bins[binIndex]++;
        });
        
        return { labels, counts: bins };
    }

    // Correlation Analysis
    calculateCorrelation() {
        if (!this.currentData) return;
        
        const method = document.getElementById('correlationMethod').value;
        const numericColumns = this.getNumericColumns();
        
        if (numericColumns.length < 2) {
            this.showAlert('Need at least 2 numeric columns for correlation analysis', 'warning');
            return;
        }
        
        const correlationMatrix = this.computeCorrelationMatrix(numericColumns, method);
        this.visualizeCorrelationMatrix(correlationMatrix, numericColumns);
    }

    computeCorrelationMatrix(columns, method) {
        const matrix = [];
        
        for (let i = 0; i < columns.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < columns.length; j++) {
                if (i === j) {
                    matrix[i][j] = 1;
                } else {
                    const correlation = this.calculateCorrelationCoefficient(
                        columns[i], columns[j], method
                    );
                    matrix[i][j] = correlation;
                }
            }
        }
        
        return matrix;
    }

    calculateCorrelationCoefficient(col1, col2, method) {
        const pairs = this.currentData
            .map(row => [row[col1], row[col2]])
            .filter(pair => pair[0] !== null && pair[1] !== null && 
                           !isNaN(pair[0]) && !isNaN(pair[1]));
        
        if (pairs.length < 2) return 0;
        
        if (method === 'pearson') {
            return this.pearsonCorrelation(pairs);
        } else if (method === 'spearman') {
            return this.spearmanCorrelation(pairs);
        } else {
            return this.pearsonCorrelation(pairs); // Default to Pearson
        }
    }

    pearsonCorrelation(pairs) {
        const n = pairs.length;
        const sumX = pairs.reduce((sum, pair) => sum + pair[0], 0);
        const sumY = pairs.reduce((sum, pair) => sum + pair[1], 0);
        const sumXY = pairs.reduce((sum, pair) => sum + pair[0] * pair[1], 0);
        const sumXX = pairs.reduce((sum, pair) => sum + pair[0] * pair[0], 0);
        const sumYY = pairs.reduce((sum, pair) => sum + pair[1] * pair[1], 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }

    spearmanCorrelation(pairs) {
        // Simplified Spearman - convert to ranks and calculate Pearson
        const xRanks = this.getRanks(pairs.map(p => p[0]));
        const yRanks = this.getRanks(pairs.map(p => p[1]));
        const rankedPairs = xRanks.map((x, i) => [x, yRanks[i]]);
        return this.pearsonCorrelation(rankedPairs);
    }

    getRanks(values) {
        const sorted = values.map((v, i) => ({ value: v, index: i }))
                            .sort((a, b) => a.value - b.value);
        const ranks = new Array(values.length);
        
        sorted.forEach((item, rank) => {
            ranks[item.index] = rank + 1;
        });
        
        return ranks;
    }

    visualizeCorrelationMatrix(matrix, columns) {
        if (this.correlationChart) {
            this.correlationChart.destroy();
        }
        
        const ctx = document.getElementById('correlationChart').getContext('2d');
        
        // Convert matrix to heatmap data
        const data = [];
        const labels = [];
        
        for (let i = 0; i < columns.length; i++) {
            for (let j = 0; j < columns.length; j++) {
                data.push({
                    x: j,
                    y: i,
                    v: matrix[i][j]
                });
            }
            labels.push(columns[i]);
        }
        
        this.correlationChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Correlation',
                    data: data.map(d => ({
                        x: d.x,
                        y: d.y,
                        r: Math.abs(d.v) * 20 // Size based on correlation strength
                    })),
                    backgroundColor: data.map(d => {
                        const intensity = Math.abs(d.v);
                        const r = d.v > 0 ? Math.floor(31 + intensity * 150) : Math.floor(180 + intensity * 75);
                        const g = d.v > 0 ? Math.floor(184 + intensity * 71) : Math.floor(65 + intensity * 54);
                        const b = d.v > 0 ? Math.floor(205 + intensity * 50) : Math.floor(47 + intensity * 118);
                        return `rgb(${r}, ${g}, ${b})`;
                    })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Correlation Matrix'
                    },
                    tooltip: {
                        callbacks: {
                            title: () => '',
                            label: (context) => {
                                const point = data[context.dataIndex];
                                return `${labels[point.y]} vs ${labels[point.x]}: ${point.v.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: -0.5,
                        max: columns.length - 0.5,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => labels[value] || ''
                        },
                        title: {
                            display: true,
                            text: 'Variables'
                        }
                    },
                    y: {
                        type: 'linear',
                        min: -0.5,
                        max: columns.length - 0.5,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => labels[value] || ''
                        },
                        title: {
                            display: true,
                            text: 'Variables'
                        }
                    }
                }
            }
        });
    }

    // Data Cleaning
    handleMissingValues() {
        if (!this.currentData) return;
        
        const action = document.getElementById('missingValueAction').value;
        let processedData = [...this.currentData];
        let message = '';
        
        switch (action) {
            case 'drop':
                const originalLength = processedData.length;
                processedData = processedData.filter(row => 
                    Object.values(row).every(val => val !== null && val !== undefined)
                );
                message = `Removed ${originalLength - processedData.length} rows with missing values`;
                break;
                
            case 'fillMean':
                this.fillMissingWithStatistic(processedData, 'mean');
                message = 'Filled missing numeric values with column means';
                break;
                
            case 'fillMedian':
                this.fillMissingWithStatistic(processedData, 'median');
                message = 'Filled missing numeric values with column medians';
                break;
                
            case 'fillMode':
                this.fillMissingWithMode(processedData);
                message = 'Filled missing values with column modes';
                break;
                
            case 'fillZero':
                this.fillMissingWithValue(processedData, 0);
                message = 'Filled missing values with zero';
                break;
        }
        
        this.currentData = processedData;
        this.updateDataOverview();
        this.updateColumnSelectors(); // Update selectors after data changes
        this.showAlert(message, 'success');
        
        document.getElementById('cleaningResults').innerHTML = `
            <div class="alert alert--success">
                <strong>Missing Values Handled:</strong> ${message}
            </div>
        `;
        document.getElementById('cleaningResults').classList.remove('hidden');
    }

    fillMissingWithStatistic(data, statistic) {
        const numericColumns = this.getNumericColumns();
        
        numericColumns.forEach(column => {
            const values = data.map(row => row[column])
                             .filter(val => val !== null && val !== undefined && !isNaN(val));
            
            if (values.length > 0) {
                let fillValue;
                if (statistic === 'mean') {
                    fillValue = values.reduce((a, b) => a + b, 0) / values.length;
                } else if (statistic === 'median') {
                    fillValue = this.percentile(values.sort((a, b) => a - b), 0.5);
                }
                
                data.forEach(row => {
                    if (row[column] === null || row[column] === undefined || isNaN(row[column])) {
                        row[column] = fillValue;
                    }
                });
            }
        });
    }

    fillMissingWithMode(data) {
        const columns = Object.keys(data[0]);
        
        columns.forEach(column => {
            const valueCounts = {};
            data.forEach(row => {
                const value = row[column];
                if (value !== null && value !== undefined) {
                    valueCounts[value] = (valueCounts[value] || 0) + 1;
                }
            });
            
            if (Object.keys(valueCounts).length > 0) {
                const mode = Object.keys(valueCounts).reduce((a, b) => 
                    valueCounts[a] > valueCounts[b] ? a : b
                );
                
                data.forEach(row => {
                    if (row[column] === null || row[column] === undefined) {
                        row[column] = mode;
                    }
                });
            }
        });
    }

    fillMissingWithValue(data, value) {
        data.forEach(row => {
            Object.keys(row).forEach(column => {
                if (row[column] === null || row[column] === undefined) {
                    row[column] = value;
                }
            });
        });
    }

    detectOutliers() {
        if (!this.currentData) return;
        
        const method = document.getElementById('outlierMethod').value;
        const numericColumns = this.getNumericColumns();
        this.outlierIndices = [];
        
        if (method === 'iqr') {
            this.detectOutliersIQR(numericColumns);
        } else if (method === 'zscore') {
            this.detectOutliersZScore(numericColumns);
        }
        
        const message = `Found ${this.outlierIndices.length} outlier rows using ${method} method`;
        this.showAlert(message, 'info');
        
        document.getElementById('cleaningResults').innerHTML = `
            <div class="alert alert--info">
                <strong>Outlier Detection:</strong> ${message}
            </div>
        `;
        document.getElementById('cleaningResults').classList.remove('hidden');
    }

    detectOutliersIQR(columns) {
        columns.forEach(column => {
            const values = this.currentData.map(row => row[column])
                                         .filter(val => val !== null && val !== undefined && !isNaN(val));
            
            if (values.length > 0) {
                const sorted = values.sort((a, b) => a - b);
                const q1 = this.percentile(sorted, 0.25);
                const q3 = this.percentile(sorted, 0.75);
                const iqr = q3 - q1;
                const lowerBound = q1 - 1.5 * iqr;
                const upperBound = q3 + 1.5 * iqr;
                
                this.currentData.forEach((row, index) => {
                    const value = row[column];
                    if (value !== null && !isNaN(value) && 
                        (value < lowerBound || value > upperBound)) {
                        if (!this.outlierIndices.includes(index)) {
                            this.outlierIndices.push(index);
                        }
                    }
                });
            }
        });
    }

    detectOutliersZScore(columns) {
        columns.forEach(column => {
            const values = this.currentData.map(row => row[column])
                                         .filter(val => val !== null && val !== undefined && !isNaN(val));
            
            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
                
                this.currentData.forEach((row, index) => {
                    const value = row[column];
                    if (value !== null && !isNaN(value)) {
                        const zScore = Math.abs((value - mean) / std);
                        if (zScore > 3) { // Z-score threshold of 3
                            if (!this.outlierIndices.includes(index)) {
                                this.outlierIndices.push(index);
                            }
                        }
                    }
                });
            }
        });
    }

    removeOutliers() {
        if (!this.currentData || this.outlierIndices.length === 0) {
            this.showAlert('No outliers detected. Run outlier detection first.', 'warning');
            return;
        }
        
        const originalLength = this.currentData.length;
        this.currentData = this.currentData.filter((_, index) => !this.outlierIndices.includes(index));
        this.outlierIndices = [];
        
        this.updateDataOverview();
        this.updateColumnSelectors(); // Update selectors after data changes
        const message = `Removed ${originalLength - this.currentData.length} outlier rows`;
        this.showAlert(message, 'success');
        
        document.getElementById('cleaningResults').innerHTML = `
            <div class="alert alert--success">
                <strong>Outliers Removed:</strong> ${message}
            </div>
        `;
    }

    detectDuplicates() {
        if (!this.currentData) return;
        
        const seen = new Set();
        let duplicateCount = 0;
        
        this.currentData.forEach(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) {
                duplicateCount++;
            } else {
                seen.add(key);
            }
        });
        
        const message = `Found ${duplicateCount} duplicate rows`;
        this.showAlert(message, 'info');
        
        document.getElementById('cleaningResults').innerHTML = `
            <div class="alert alert--info">
                <strong>Duplicate Detection:</strong> ${message}
            </div>
        `;
        document.getElementById('cleaningResults').classList.remove('hidden');
    }

    removeDuplicates() {
        if (!this.currentData) return;
        
        const originalLength = this.currentData.length;
        const seen = new Set();
        const uniqueData = [];
        
        this.currentData.forEach(row => {
            const key = JSON.stringify(row);
            if (!seen.has(key)) {
                seen.add(key);
                uniqueData.push(row);
            }
        });
        
        this.currentData = uniqueData;
        this.updateDataOverview();
        this.updateColumnSelectors(); // Update selectors after data changes
        
        const message = `Removed ${originalLength - this.currentData.length} duplicate rows`;
        this.showAlert(message, 'success');
        
        document.getElementById('cleaningResults').innerHTML = `
            <div class="alert alert--success">
                <strong>Duplicates Removed:</strong> ${message}
            </div>
        `;
    }

    // Feature Engineering
    applyScaling() {
        if (!this.currentData) return;
        
        const method = document.getElementById('scalingMethod').value;
        const column = document.getElementById('scaleColumn').value;
        
        if (!column) {
            this.showAlert('Please select a column to scale', 'warning');
            return;
        }
        
        const values = this.currentData.map(row => row[column])
                                     .filter(val => val !== null && val !== undefined && !isNaN(val));
        
        if (values.length === 0) {
            this.showAlert('Selected column has no numeric values', 'error');
            return;
        }
        
        let scaledValues;
        let newColumnName = `${column}_scaled_${method}`;
        
        switch (method) {
            case 'standard':
                scaledValues = this.standardScale(values);
                break;
            case 'minmax':
                scaledValues = this.minMaxScale(values);
                break;
            case 'robust':
                scaledValues = this.robustScale(values);
                break;
            default:
                this.showAlert('Unknown scaling method', 'error');
                return;
        }
        
        // Add scaled column to data
        let valueIndex = 0;
        this.currentData.forEach(row => {
            if (row[column] !== null && row[column] !== undefined && !isNaN(row[column])) {
                row[newColumnName] = scaledValues[valueIndex++];
            } else {
                row[newColumnName] = null;
            }
        });
        
        this.updateDataOverview();
        this.updateColumnSelectors();
        
        const message = `Applied ${method} scaling to ${column}. New column: ${newColumnName}`;
        this.showAlert(message, 'success');
        
        document.getElementById('engineeringResults').innerHTML = `
            <div class="alert alert--success">
                <strong>Scaling Applied:</strong> ${message}
            </div>
        `;
        document.getElementById('engineeringResults').classList.remove('hidden');
    }

    standardScale(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        return values.map(val => (val - mean) / std);
    }

    minMaxScale(values) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        return values.map(val => range === 0 ? 0 : (val - min) / range);
    }

    robustScale(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const median = this.percentile(sorted, 0.5);
        const q1 = this.percentile(sorted, 0.25);
        const q3 = this.percentile(sorted, 0.75);
        const iqr = q3 - q1;
        return values.map(val => iqr === 0 ? 0 : (val - median) / iqr);
    }

    applyTransformation() {
        if (!this.currentData) return;
        
        const method = document.getElementById('transformMethod').value;
        const column = document.getElementById('transformColumn').value;
        
        if (!column) {
            this.showAlert('Please select a column to transform', 'warning');
            return;
        }
        
        const newColumnName = `${column}_${method}`;
        
        try {
            this.currentData.forEach(row => {
                const value = row[column];
                if (value !== null && value !== undefined && !isNaN(value)) {
                    switch (method) {
                        case 'log':
                            row[newColumnName] = value > 0 ? Math.log(value) : null;
                            break;
                        case 'sqrt':
                            row[newColumnName] = value >= 0 ? Math.sqrt(value) : null;
                            break;
                        case 'square':
                            row[newColumnName] = value * value;
                            break;
                    }
                } else {
                    row[newColumnName] = null;
                }
            });
            
            this.updateDataOverview();
            this.updateColumnSelectors();
            
            const message = `Applied ${method} transformation to ${column}. New column: ${newColumnName}`;
            this.showAlert(message, 'success');
            
            document.getElementById('engineeringResults').innerHTML = `
                <div class="alert alert--success">
                    <strong>Transformation Applied:</strong> ${message}
                </div>
            `;
            document.getElementById('engineeringResults').classList.remove('hidden');
            
        } catch (error) {
            this.showAlert(`Error applying transformation: ${error.message}`, 'error');
        }
    }

    // Export Functions
    downloadCSV() {
        if (!this.currentData) {
            this.showAlert('No data to export', 'warning');
            return;
        }
        
        const csv = this.convertToCSV(this.currentData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showAlert('Data exported successfully', 'success');
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const columns = Object.keys(data[0]);
        const header = columns.join(',');
        const rows = data.map(row => 
            columns.map(col => {
                const value = row[col];
                if (value === null || value === undefined) return '';
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        );
        
        return [header, ...rows].join('\n');
    }

    generateReport() {
        if (!this.currentData) {
            this.showAlert('No data to analyze', 'warning');
            return;
        }
        
        const report = this.createAnalysisReport();
        this.showModal('Analysis Report', report);
    }

    createAnalysisReport() {
        const numericColumns = this.getNumericColumns();
        const categoricalColumns = this.getCategoricalColumns();
        const missingValues = this.countMissingValues();
        
        let report = `
            <div class="report-section">
                <h3>Dataset Summary</h3>
                <ul>
                    <li><strong>Total Rows:</strong> ${this.currentData.length}</li>
                    <li><strong>Total Columns:</strong> ${Object.keys(this.currentData[0]).length}</li>
                    <li><strong>Numeric Columns:</strong> ${numericColumns.length}</li>
                    <li><strong>Categorical Columns:</strong> ${categoricalColumns.length}</li>
                    <li><strong>Total Missing Values:</strong> ${Object.values(missingValues).reduce((a, b) => a + b, 0)}</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h3>Column Information</h3>
                <table class="stats-table">
                    <thead>
                        <tr><th>Column</th><th>Type</th><th>Missing Values</th><th>Unique Values</th></tr>
                    </thead>
                    <tbody>
        `;
        
        Object.keys(this.currentData[0]).forEach(column => {
            const isNumeric = numericColumns.includes(column);
            const missing = missingValues[column] || 0;
            const uniqueValues = new Set(this.currentData.map(row => row[column])).size;
            
            report += `
                <tr>
                    <td>${column}</td>
                    <td>${isNumeric ? 'Numeric' : 'Categorical'}</td>
                    <td>${missing}</td>
                    <td>${uniqueValues}</td>
                </tr>
            `;
        });
        
        report += `
                    </tbody>
                </table>
            </div>
        `;
        
        if (numericColumns.length > 0) {
            report += `
                <div class="report-section">
                    <h3>Numeric Column Statistics</h3>
                    <table class="stats-table">
                        <thead>
                            <tr><th>Column</th><th>Mean</th><th>Std</th><th>Min</th><th>Max</th></tr>
                        </thead>
                        <tbody>
            `;
            
            numericColumns.forEach(column => {
                const values = this.currentData.map(row => row[column])
                                             .filter(val => val !== null && val !== undefined && !isNaN(val));
                if (values.length > 0) {
                    const stats = this.calculateDescriptiveStats(values);
                    report += `
                        <tr>
                            <td>${column}</td>
                            <td>${stats.mean.toFixed(2)}</td>
                            <td>${stats.std.toFixed(2)}</td>
                            <td>${stats.min.toFixed(2)}</td>
                            <td>${stats.max.toFixed(2)}</td>
                        </tr>
                    `;
                }
            });
            
            report += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        return report;
    }

    exportCharts() {
        if (!this.currentChart && !this.correlationChart) {
            this.showAlert('No charts to export', 'warning');
            return;
        }
        
        if (this.currentChart) {
            const url = this.currentChart.toBase64Image();
            const a = document.createElement('a');
            a.href = url;
            a.download = 'main_chart.png';
            a.click();
        }
        
        if (this.correlationChart) {
            const url = this.correlationChart.toBase64Image();
            const a = document.createElement('a');
            a.href = url;
            a.download = 'correlation_chart.png';
            a.click();
        }
        
        this.showAlert('Charts exported successfully', 'success');
    }

    // Utility Functions
    getNumericColumns() {
        if (!this.currentData || this.currentData.length === 0) return [];
        
        return Object.keys(this.currentData[0]).filter(column => {
            return this.currentData.some(row => {
                const value = row[column];
                return value !== null && value !== undefined && 
                       typeof value === 'number' && !isNaN(value);
            });
        });
    }

    getCategoricalColumns() {
        if (!this.currentData || this.currentData.length === 0) return [];
        
        const numericColumns = this.getNumericColumns();
        return Object.keys(this.currentData[0]).filter(column => 
            !numericColumns.includes(column)
        );
    }

    countMissingValues() {
        if (!this.currentData || this.currentData.length === 0) return {};
        
        const missingValues = {};
        Object.keys(this.currentData[0]).forEach(column => {
            missingValues[column] = this.currentData.filter(row => 
                row[column] === null || row[column] === undefined
            ).length;
        });
        
        return missingValues;
    }

    showAlert(message, type) {
        // Create and show a temporary alert
        const alert = document.createElement('div');
        alert.className = `alert alert--${type}`;
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '1001';
        alert.style.minWidth = '300px';
        alert.innerHTML = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EDAProApp();
});