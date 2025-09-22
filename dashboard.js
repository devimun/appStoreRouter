
document.addEventListener('DOMContentLoaded', () => {
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

        // 전체 조회수 표시
        totalViewsEl.textContent = allLogs.length.toLocaleString();

        // 오늘 날짜로 Date Picker 초기화 (YYYY-MM-DD)
        datePicker.value = new Date().toISOString().split('T')[0];

        // 채널 선택 드롭다운 채우기
        const channels = [...new Set(allLogs.map(log => log.channel))];
        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel;
            option.textContent = channel;
            detailedChannelSelect.appendChild(option);
        });

        // 차트 렌더링
        renderHourlyChart();
        renderDetailedChart();

        // 이벤트 리스너 등록
        datePicker.addEventListener('change', renderHourlyChart);
        detailedChannelSelect.addEventListener('change', renderDetailedChart);
        deviceFilterSelect.addEventListener('change', renderDetailedChart);
    }

    // --- 시간대별 채널 조회수 차트 --- 
    function renderHourlyChart() {
        const selectedDate = datePicker.value;
        const filteredLogs = allLogs.filter(log => log.timestamp.startsWith(selectedDate));

        const hourlyData = {}; // { 'channel/detail': [0, 0, ...], ... }
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

        if (hourlyChart) hourlyChart.destroy();
        hourlyChart = new Chart(hourlyChartCanvas, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: `${selectedDate} 시간대별 조회수` } },
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
            }
        });
    }

    // --- 세부 채널별 조회수 차트 ---
    function renderDetailedChart() {
        const selectedChannel = detailedChannelSelect.value;
        const selectedDevice = deviceFilterSelect.value;

        let filteredLogs = allLogs.filter(log => log.channel === selectedChannel);
        if (selectedDevice !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.device === selectedDevice);
        }

        const detailedData = {}; // { 'detail[0]': count, ... }
        filteredLogs.forEach(log => {
            const key = log.details[0] || 'N/A';
            detailedData[key] = (detailedData[key] || 0) + 1;
        });

        // 조회수 순으로 정렬
        const sortedDetailedData = Object.entries(detailedData).sort(([, a], [, b]) => b - a);

        const labels = sortedDetailedData.map(item => item[0]);
        const data = sortedDetailedData.map(item => item[1]);

        if (detailedChart) detailedChart.destroy();
        detailedChart = new Chart(detailedChartCanvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: `${selectedChannel} (${selectedDevice}) 조회수`,
                    data,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: { title: { display: true, text: `채널 [${selectedChannel}] 상세 조회수` } },
                scales: { x: { beginAtZero: true } }
            }
        });
    }

    // 데이터 가져오기 시작
    fetchData();
});
