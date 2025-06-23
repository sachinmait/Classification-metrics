// Classification Metrics Dashboard
class MetricsDashboard {
    constructor() {
        this.currentScenario = 'medical_diagnosis';
        this.currentThreshold = 0.5;
        this.datasets = {};
        this.charts = {};
        
        // Dataset URLs
        this.datasetUrls = {
            medical_diagnosis: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7d011a52260248ba6da70f3302c29af0/c941847a-f172-4f9d-ba19-a2896d7cbeb3/73e5f3a2.json',
            spam_detection: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7d011a52260248ba6da70f3302c29af0/c941847a-f172-4f9d-ba19-a2896d7cbeb3/a8cdebe2.json',
            fraud_detection: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7d011a52260248ba6da70f3302c29af0/c941847a-f172-4f9d-ba19-a2896d7cbeb3/92cda477.json',
            hiring_algorithm: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7d011a52260248ba6da70f3302c29af0/c941847a-f172-4f9d-ba19-a2896d7cbeb3/639a8897.json',
            quality_control: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7d011a52260248ba6da70f3302c29af0/c941847a-f172-4f9d-ba19-a2896d7cbeb3/b52c41f1.json'
        };
        
        this.init();
    }

    async init() {
        await this.loadAllDatasets();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateScenario(this.currentScenario);
        this.setupTooltips();
        this.setupThemeToggle();
    }

    async loadAllDatasets() {
        const loadPromises = Object.entries(this.datasetUrls).map(async ([key, url]) => {
            try {
                const response = await fetch(url);
                const data = await response.json();
                this.datasets[key] = data;
            } catch (error) {
                console.error(`Failed to load ${key} dataset:`, error);
                // Fallback to embedded data if external fails
                this.datasets[key] = this.getFallbackData(key);
            }
        });
        
        await Promise.all(loadPromises);
    }

    getFallbackData(scenario) {
        // Fallback datasets with synthetic data
        const fallbackData = {
            medical_diagnosis: {
                scenario: "Cancer Screening",
                description: "Medical diagnostic test results for cancer detection using mammography screening",
                cost_matrix: {
                    false_positive: "Unnecessary anxiety, additional tests, potential biopsy ($500-2000)",
                    false_negative: "Missed diagnosis, delayed treatment, potential death ($100,000+)"
                },
                priority: "Minimize False Negatives",
                optimal_threshold: 0.3,
                prevalence: 0.05,
                data: this.generateSyntheticData(1000, 0.05, 0.3)
            },
            spam_detection: {
                scenario: "Email Spam Filter",
                description: "Email classification system distinguishing between legitimate emails and spam",
                cost_matrix: {
                    false_positive: "Important email sent to spam folder, missed opportunities ($50-500)",
                    false_negative: "Spam in inbox, minor inconvenience, potential phishing risk ($1-10)"
                },
                priority: "Minimize False Positives",
                optimal_threshold: 0.7,
                prevalence: 0.4,
                data: this.generateSyntheticData(1000, 0.4, 0.7)
            },
            fraud_detection: {
                scenario: "Credit Card Fraud Detection",
                description: "Transaction monitoring system for detecting fraudulent credit card transactions",
                cost_matrix: {
                    false_positive: "Legitimate transaction blocked, customer frustration ($50-200)",
                    false_negative: "Fraudulent transaction approved, financial loss ($500-5000)"
                },
                priority: "Balance Both Types",
                optimal_threshold: 0.4,
                prevalence: 0.02,
                data: this.generateSyntheticData(1000, 0.02, 0.4)
            },
            hiring_algorithm: {
                scenario: "AI-Powered Hiring Algorithm",
                description: "Automated resume screening system for identifying qualified job candidates",
                cost_matrix: {
                    false_positive: "Unqualified candidate interviewed, wasted time and resources ($200-500)",
                    false_negative: "Qualified candidate rejected, missed talent, potential bias lawsuit ($1,000-50,000)"
                },
                priority: "Minimize False Negatives",
                optimal_threshold: 0.35,
                prevalence: 0.15,
                data: this.generateSyntheticData(1000, 0.15, 0.35)
            },
            quality_control: {
                scenario: "Manufacturing Quality Control",
                description: "Automated inspection system for detecting defective products on production line",
                cost_matrix: {
                    false_positive: "Good product marked as defective, waste and rework ($20-100)",
                    false_negative: "Defective product shipped to customer, returns and reputation damage ($200-2000)"
                },
                priority: "Minimize False Negatives",
                optimal_threshold: 0.3,
                prevalence: 0.08,
                data: this.generateSyntheticData(1000, 0.08, 0.3)
            }
        };
        
        return fallbackData[scenario];
    }

    generateSyntheticData(size, prevalence, optimalThreshold) {
        const data = [];
        const positiveCount = Math.floor(size * prevalence);
        
        // Generate positive samples (higher scores)
        for (let i = 0; i < positiveCount; i++) {
            const score = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
            data.push({
                prediction_score: Math.round(score * 100) / 100,
                actual: 1,
                predicted: score >= optimalThreshold ? 1 : 0
            });
        }
        
        // Generate negative samples (lower scores)
        for (let i = 0; i < size - positiveCount; i++) {
            const score = Math.random() * 0.6; // 0.0 to 0.6
            data.push({
                prediction_score: Math.round(score * 100) / 100,
                actual: 0,
                predicted: score >= optimalThreshold ? 1 : 0
            });
        }
        
        return data;
    }

    setupEventListeners() {
        // Scenario selector
        document.getElementById('scenario-select').addEventListener('change', (e) => {
            this.updateScenario(e.target.value);
        });

        // Threshold slider
        const thresholdSlider = document.getElementById('threshold-slider');
        thresholdSlider.addEventListener('input', (e) => {
            this.updateThreshold(parseFloat(e.target.value));
        });

        // Threshold buttons
        document.getElementById('optimal-threshold-btn').addEventListener('click', () => {
            const optimal = this.datasets[this.currentScenario]?.optimal_threshold || 0.5;
            thresholdSlider.value = optimal;
            this.updateThreshold(optimal);
        });

        document.getElementById('reset-threshold-btn').addEventListener('click', () => {
            thresholdSlider.value = 0.5;
            this.updateThreshold(0.5);
        });

        // Help modal - Fixed event listeners
        const helpModal = document.getElementById('help-modal');
        const helpBtn = document.getElementById('help-btn');
        const closeHelpBtn = document.getElementById('close-help');

        helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            helpModal.classList.remove('hidden');
        });

        closeHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            helpModal.classList.add('hidden');
        });

        // Close modal on backdrop click
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
                helpModal.classList.add('hidden');
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
        }

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';
            
            if (isDark) {
                document.documentElement.setAttribute('data-color-scheme', 'light');
                themeToggle.textContent = '🌙 Dark Mode';
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-color-scheme', 'dark');
                themeToggle.textContent = '☀️ Light Mode';
                localStorage.setItem('theme', 'dark');
            }
            
            // Update charts for theme change
            this.updateChartThemes();
        });
    }

    setupTooltips() {
        const tooltip = document.getElementById('tooltip');
        const triggers = document.querySelectorAll('[data-tooltip]');

        triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => {
                const text = e.target.getAttribute('data-tooltip');
                tooltip.textContent = text;
                tooltip.classList.remove('hidden');
                
                // Position tooltip
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            });

            trigger.addEventListener('mouseleave', () => {
                tooltip.classList.add('hidden');
            });
        });
    }

    updateScenario(scenarioKey) {
        this.currentScenario = scenarioKey;
        const scenario = this.datasets[scenarioKey];
        
        if (!scenario) return;

        // Update scenario info
        document.getElementById('scenario-title').textContent = scenario.scenario;
        document.getElementById('scenario-description').textContent = scenario.description;
        document.getElementById('fp-cost').textContent = scenario.cost_matrix.false_positive;
        document.getElementById('fn-cost').textContent = scenario.cost_matrix.false_negative;
        document.getElementById('priority-text').textContent = scenario.priority;

        // Update threshold to optimal for new scenario
        const optimalThreshold = scenario.optimal_threshold || 0.5;
        document.getElementById('threshold-slider').value = optimalThreshold;
        this.updateThreshold(optimalThreshold);
    }

    updateThreshold(threshold) {
        this.currentThreshold = threshold;
        document.getElementById('threshold-value').textContent = threshold.toFixed(2);

        // Recalculate predictions based on new threshold
        this.recalculatePredictions();
        
        // Update all displays
        this.updateMetrics();
        this.updateConfusionMatrix();
        this.updateCharts();
        this.updateCostCalculator();
    }

    recalculatePredictions() {
        const scenario = this.datasets[this.currentScenario];
        if (!scenario || !scenario.data) return;

        scenario.data.forEach(sample => {
            sample.predicted = sample.prediction_score >= this.currentThreshold ? 1 : 0;
        });
    }

    calculateMetrics() {
        const scenario = this.datasets[this.currentScenario];
        if (!scenario || !scenario.data) return null;

        let tp = 0, tn = 0, fp = 0, fn = 0;

        scenario.data.forEach(sample => {
            if (sample.actual === 1 && sample.predicted === 1) tp++;
            else if (sample.actual === 0 && sample.predicted === 0) tn++;
            else if (sample.actual === 0 && sample.predicted === 1) fp++;
            else if (sample.actual === 1 && sample.predicted === 0) fn++;
        });

        const total = tp + tn + fp + fn;
        const accuracy = total > 0 ? (tp + tn) / total : 0;
        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const specificity = (tn + fp) > 0 ? tn / (tn + fp) : 0;
        const npv = (tn + fn) > 0 ? tn / (tn + fn) : 0;
        const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

        return {
            tp, tn, fp, fn, total,
            accuracy, precision, recall, specificity, npv, f1
        };
    }

    updateMetrics() {
        const metrics = this.calculateMetrics();
        if (!metrics) return;

        // Update metric values and bars
        this.updateMetricDisplay('accuracy', metrics.accuracy);
        this.updateMetricDisplay('precision', metrics.precision);
        this.updateMetricDisplay('recall', metrics.recall);
        this.updateMetricDisplay('specificity', metrics.specificity);
        this.updateMetricDisplay('npv', metrics.npv);
        this.updateMetricDisplay('f1', metrics.f1);
    }

    updateMetricDisplay(metricName, value) {
        const valueElement = document.getElementById(`${metricName}-value`);
        const fillElement = document.getElementById(`${metricName}-fill`);
        
        if (valueElement && fillElement) {
            valueElement.textContent = (value * 100).toFixed(1) + '%';
            fillElement.style.width = (value * 100) + '%';
            
            // Color coding based on value
            const color = value >= 0.8 ? 'var(--color-success)' : 
                         value >= 0.6 ? 'var(--color-warning)' : 'var(--color-error)';
            fillElement.style.backgroundColor = color;
        }
    }

    updateConfusionMatrix() {
        const metrics = this.calculateMetrics();
        if (!metrics) return;

        const { tp, tn, fp, fn, total } = metrics;

        // Update values
        document.getElementById('tp-value').textContent = tp;
        document.getElementById('tn-value').textContent = tn;
        document.getElementById('fp-value').textContent = fp;
        document.getElementById('fn-value').textContent = fn;

        // Update percentages
        document.getElementById('tp-percent').textContent = total > 0 ? ((tp / total) * 100).toFixed(1) + '%' : '0%';
        document.getElementById('tn-percent').textContent = total > 0 ? ((tn / total) * 100).toFixed(1) + '%' : '0%';
        document.getElementById('fp-percent').textContent = total > 0 ? ((fp / total) * 100).toFixed(1) + '%' : '0%';
        document.getElementById('fn-percent').textContent = total > 0 ? ((fn / total) * 100).toFixed(1) + '%' : '0%';
    }

    initializeCharts() {
        this.initROCChart();
        this.initPRChart();
    }

    initROCChart() {
        const ctx = document.getElementById('roc-chart').getContext('2d');
        
        this.charts.roc = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'ROC Curve',
                    data: [],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: true
                }, {
                    label: 'Random Classifier',
                    data: [{x: 0, y: 0}, {x: 1, y: 1}],
                    borderColor: '#B4413C',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }, {
                    label: 'Current Threshold',
                    data: [],
                    backgroundColor: '#FFC185',
                    borderColor: '#D2BA4C',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'False Positive Rate'
                        },
                        min: 0,
                        max: 1
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'True Positive Rate'
                        },
                        min: 0,
                        max: 1
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initPRChart() {
        const ctx = document.getElementById('pr-chart').getContext('2d');
        
        this.charts.pr = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'PR Curve',
                    data: [],
                    borderColor: '#5D878F',
                    backgroundColor: 'rgba(93, 135, 143, 0.1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: true
                }, {
                    label: 'Current Threshold',
                    data: [],
                    backgroundColor: '#FFC185',
                    borderColor: '#D2BA4C',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Recall'
                        },
                        min: 0,
                        max: 1
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Precision'
                        },
                        min: 0,
                        max: 1
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateROCChart();
        this.updatePRChart();
    }

    updateROCChart() {
        const scenario = this.datasets[this.currentScenario];
        if (!scenario || !scenario.data || !this.charts.roc) return;

        // Generate ROC curve data
        const rocData = this.generateROCData(scenario.data);
        
        // Calculate current point
        const metrics = this.calculateMetrics();
        const currentFPR = metrics.specificity > 0 ? 1 - metrics.specificity : 0;
        const currentTPR = metrics.recall;

        // Update chart data
        this.charts.roc.data.datasets[0].data = rocData;
        this.charts.roc.data.datasets[2].data = [{x: currentFPR, y: currentTPR}];
        
        // Calculate and display AUC
        const auc = this.calculateAUC(rocData);
        document.getElementById('auc-value').textContent = auc.toFixed(3);
        
        this.charts.roc.update('none');
    }

    updatePRChart() {
        const scenario = this.datasets[this.currentScenario];
        if (!scenario || !scenario.data || !this.charts.pr) return;

        // Generate PR curve data
        const prData = this.generatePRData(scenario.data);
        
        // Calculate current point
        const metrics = this.calculateMetrics();
        const currentPrecision = metrics.precision;
        const currentRecall = metrics.recall;

        // Update chart data
        this.charts.pr.data.datasets[0].data = prData;
        this.charts.pr.data.datasets[1].data = [{x: currentRecall, y: currentPrecision}];
        
        // Calculate and display Average Precision
        const ap = this.calculateAP(prData);
        document.getElementById('ap-value').textContent = ap.toFixed(3);
        
        this.charts.pr.update('none');
    }

    generateROCData(data) {
        const thresholds = [...new Set(data.map(d => d.prediction_score))].sort((a, b) => b - a);
        const rocPoints = [];

        for (const threshold of thresholds) {
            let tp = 0, fp = 0, tn = 0, fn = 0;
            
            data.forEach(sample => {
                const predicted = sample.prediction_score >= threshold ? 1 : 0;
                if (sample.actual === 1 && predicted === 1) tp++;
                else if (sample.actual === 0 && predicted === 1) fp++;
                else if (sample.actual === 0 && predicted === 0) tn++;
                else if (sample.actual === 1 && predicted === 0) fn++;
            });

            const tpr = (tp + fn) > 0 ? tp / (tp + fn) : 0;
            const fpr = (fp + tn) > 0 ? fp / (fp + tn) : 0;
            
            rocPoints.push({x: fpr, y: tpr});
        }

        // Add endpoints
        rocPoints.unshift({x: 0, y: 0});
        rocPoints.push({x: 1, y: 1});

        return rocPoints;
    }

    generatePRData(data) {
        const thresholds = [...new Set(data.map(d => d.prediction_score))].sort((a, b) => b - a);
        const prPoints = [];

        for (const threshold of thresholds) {
            let tp = 0, fp = 0, fn = 0;
            
            data.forEach(sample => {
                const predicted = sample.prediction_score >= threshold ? 1 : 0;
                if (sample.actual === 1 && predicted === 1) tp++;
                else if (sample.actual === 0 && predicted === 1) fp++;
                else if (sample.actual === 1 && predicted === 0) fn++;
            });

            const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
            const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
            
            if (precision > 0 || recall > 0) {
                prPoints.push({x: recall, y: precision});
            }
        }

        return prPoints.sort((a, b) => a.x - b.x);
    }

    calculateAUC(rocData) {
        if (rocData.length < 2) return 0;
        
        let auc = 0;
        for (let i = 1; i < rocData.length; i++) {
            const width = rocData[i].x - rocData[i-1].x;
            const height = (rocData[i].y + rocData[i-1].y) / 2;
            auc += width * height;
        }
        
        return Math.max(0, Math.min(1, auc));
    }

    calculateAP(prData) {
        if (prData.length < 2) return 0;
        
        let ap = 0;
        for (let i = 1; i < prData.length; i++) {
            const width = prData[i].x - prData[i-1].x;
            const height = prData[i].y;
            ap += width * height;
        }
        
        return Math.max(0, Math.min(1, ap));
    }

    updateCostCalculator() {
        const scenario = this.datasets[this.currentScenario];
        const metrics = this.calculateMetrics();
        
        if (!scenario || !metrics) return;

        // Extract cost estimates (simplified parsing)
        const fpCostMatch = scenario.cost_matrix.false_positive.match(/\$(\d+(?:,\d+)*(?:-\d+(?:,\d+)*)?)/);
        const fnCostMatch = scenario.cost_matrix.false_negative.match(/\$(\d+(?:,\d+)*(?:-\d+(?:,\d+)*)?)/);
        
        const fpCost = fpCostMatch ? parseInt(fpCostMatch[1].replace(/,/g, '').split('-')[0]) : 100;
        const fnCost = fnCostMatch ? parseInt(fnCostMatch[1].replace(/,/g, '').split('-')[0]) : 1000;

        const totalFPCost = metrics.fp * fpCost;
        const totalFNCost = metrics.fn * fnCost;
        const totalCost = totalFPCost + totalFNCost;

        document.getElementById('total-fp-cost').textContent = `$${totalFPCost.toLocaleString()}`;
        document.getElementById('total-fn-cost').textContent = `$${totalFNCost.toLocaleString()}`;
        document.getElementById('total-cost').textContent = `$${totalCost.toLocaleString()}`;

        // Generate recommendation
        let recommendation = '';
        if (scenario.priority.includes('False Negatives')) {
            recommendation = totalFNCost > totalFPCost ? 'Consider lowering threshold' : 'Current threshold is reasonable';
        } else if (scenario.priority.includes('False Positives')) {
            recommendation = totalFPCost > totalFNCost ? 'Consider raising threshold' : 'Current threshold is reasonable';
        } else {
            recommendation = 'Monitor both error types equally';
        }

        document.getElementById('cost-recommendation').textContent = recommendation;
    }

    updateChartThemes() {
        // Update chart colors based on current theme
        const isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';
        const textColor = isDark ? '#f5f5f5' : '#134252';
        const gridColor = isDark ? 'rgba(119, 124, 124, 0.3)' : 'rgba(94, 82, 64, 0.2)';

        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                chart.options.scales.x.ticks = { color: textColor };
                chart.options.scales.y.ticks = { color: textColor };
                chart.options.scales.x.grid = { color: gridColor };
                chart.options.scales.y.grid = { color: gridColor };
                chart.options.scales.x.title.color = textColor;
                chart.options.scales.y.title.color = textColor;
                chart.options.plugins.legend.labels = { color: textColor };
                chart.update('none');
            }
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MetricsDashboard();
});

