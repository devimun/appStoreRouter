
document.addEventListener('DOMContentLoaded', () => {
    // 플러그인 등록
    Chart.register(ChartDataLabels);

    // DOM 요소
    const totalViewsEl = document.getElementById('total-views');
    const hourlyChartCanvas = document.getElementById('hourly-chart');
    const detailedChartCanvas = document.getElementById('detailed-chart');
    const datePicker = document.getElementById('date-picker');
    const detailedChannelSelect = document.getElementById('detailed-channel-select');
    const deviceFilterSelect = document.getElementById('device-filter-select');

    let hourlyChart = null;
    let detailedChart = null;
    let allLogs = [];

    // --- 데이터 로딩 ---
    async function fetchData() {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error('Network response was not ok');
            allLogs = await response.json();
            initializeDashboard();
        } catch (error) {
            console.error('Failed to fetch data:', error);
            document.querySelector('.dashboard-container').innerHTML = '<div class="card loading">데이터를 불러오는 데 실패했습니다.</div>';
        }
    }

    // --- 대시보드 초기화 ---
    function initializeDashboard() {
        if (!allLogs || allLogs.length === 0) {
            document.querySelector('.dashboard-container').innerHTML = '<div class="card loading">표시할 데이터가 없습니다.</div>';
            return;
        }

        totalViewsEl.textContent = allLogs.length.toLocaleString();
        datePicker.value = new Date().toISOString().split('T')[0];

        const channels = [...new Set(allLogs.map(log => log.channel))];
        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel;
            option.textContent = channel;
            detailedChannelSelect.appendChild(option);
        });

        renderHourlyChart();
        renderDetailedChart();

        datePicker.addEventListener('change', renderHourlyChart);
        detailedChannelSelect.addEventListener('change', renderDetailedChart);
        deviceFilterSelect.addEventListener('change', renderDetailedChart);
    }

    // --- 시간대별 채널 조회수 차트 (데이터 레이블 추가) ---
    function renderHourlyChart() {
        const selectedDate = datePicker.value;
        const filteredLogs = allLogs.filter(log => log.timestamp.startsWith(selectedDate));

        const hourlyData = {};
        const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

        filteredLogs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            const key = `${log.channel}/${log.details[0] || 'N/A'}`;
            if (!hourlyData[key]) {
                hourlyData[key] = Array(24).fill(0);
            }
            hourlyData[key][hour]++;
        });

        const datasets = Object.keys(hourlyData).map(key => ({
            label: key,
            data: hourlyData[key],
            borderWidth: 1
        }));

        let maxDataValue = 0;
        datasets.forEach(dataset => {
            const maxInDataset = Math.max(...dataset.data);
            if (maxInDataset > maxDataValue) {
                maxDataValue = maxInDataset;
            }
        });

        if (hourlyChart) hourlyChart.destroy();
        hourlyChart = new Chart(hourlyChartCanvas, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: `${selectedDate} 시간대별 조회수` },
                    tooltip: { enabled: false }, // 툴팁 비활성화
                    datalabels: { // 데이터 레이블 플러그인 설정
                        display: true,
                        color: '#333',
                        anchor: 'end',
                        align: 'top',
                        font: { size: 10 },
                        // 값이 0보다 클 때만 숫자를 표시
                        formatter: (value) => value > 0 ? value : null
                    }
                },
                scales: {
                    x: { stacked: false },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        max: maxDataValue > 0 ? maxDataValue + 1 : 1
                    }
                }
            }
        });
    }

    // --- 세부 채널별 조회수 차트 (총 조회수 / 기기별 그룹) ---
    function renderDetailedChart() {
        const selectedChannel = detailedChannelSelect.value;
        const viewType = deviceFilterSelect.value; // 'total' or 'device'

        const filteredLogs = allLogs.filter(log => log.channel === selectedChannel);

        let labels = [];
        let datasets = [];

        if (viewType === 'total') {
            const detailedData = {};
            filteredLogs.forEach(log => {
                const key = log.details[0] || 'N/A';
                detailedData[key] = (detailedData[key] || 0) + 1;
            });
            const sortedData = Object.entries(detailedData).sort(([, a], [, b]) => b - a);
            labels = sortedData.map(item => item[0]);
            datasets = [{
                label: '총 조회수',
                data: sortedData.map(item => item[1]),
                borderWidth: 1
            }];
        } else if (viewType === 'device') {
            const detailedData = {}; // { 'kgu': { android: 5, ios: 10 }, ... }
            filteredLogs.forEach(log => {
                const key = log.details[0] || 'N/A';
                if (!detailedData[key]) {
                    detailedData[key] = { android: 0, ios: 0 };
                }
                if (log.device === 'android' || log.device === 'ios') {
                    detailedData[key][log.device]++;
                }
            });

            const sortedKeys = Object.keys(detailedData).sort((a, b) => {
                const totalA = detailedData[a].android + detailedData[a].ios;
                const totalB = detailedData[b].android + detailedData[b].ios;
                return totalB - totalA;
            });

            labels = sortedKeys;
            datasets = [
                {
                    label: 'Android',
                    data: sortedKeys.map(key => detailedData[key].android),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'iOS',
                    data: sortedKeys.map(key => detailedData[key].ios),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ];
        }

        let maxDataValue = 0;
        datasets.forEach(dataset => {
            const maxInDataset = Math.max(...dataset.data);
            if (maxInDataset > maxDataValue) {
                maxDataValue = maxInDataset;
            }
        });

        if (detailedChart) detailedChart.destroy();
        detailedChart = new Chart(detailedChartCanvas, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: `채널 [${selectedChannel}] 상세 조회수` },
                    tooltip: { enabled: false }, // 툴팁 비활성화
                    datalabels: { // 데이터 레이블 플러그인 설정
                        display: true,
                        color: '#333',
                        anchor: 'end',
                        align: 'end', // 가로 막대그래프이므로 끝(end)에 정렬
                        font: { size: 10 },
                        formatter: (value) => value > 0 ? value : null
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        max: maxDataValue > 0 ? maxDataValue + 1 : 1
                    },
                    y: { stacked: false }
                }
            }
        });
    }

    fetchData();
});
