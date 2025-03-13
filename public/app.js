document.addEventListener('DOMContentLoaded', function() {
    const eventSource = new EventSource('/api/sensors/stream');

    eventSource.onmessage = function(event) {
        const sensorData = JSON.parse(event.data);
        const typeElementId = sensorData.type.replace(/\s+/g, '');
        const row = document.getElementById(typeElementId);

        if (row) {
            row.cells[1].textContent = sensorData.value;
            row.cells[2].textContent = new Date(sensorData.timestamp).toLocaleString();
        } else {
            console.error('Row for sensor type not found:', sensorData.type);
        }
    };

    const showDataButton = document.getElementById('showData');
    showDataButton.addEventListener('click', function() {
        const selectedType = document.querySelector('input[name="sensorType"]:checked').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        const url = `/api/sensors/historical?types=${encodeURIComponent(selectedType)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

        fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch historical data');
        }
        return response.json();
    })
    .then(({ data, statistics }) => {
        const historicalTable = document.getElementById('historicalData');
        historicalTable.innerHTML = data.map(entry => `
            <tr>
                <td>${entry.sensor_type}</td>
                <td>${entry.value}</td>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
            </tr>
        `).join('');
    
        if (statistics.length > 0) {
            document.getElementById('peakValue').textContent = `Peak Value for Selected Time Period: ${statistics[0].peak_value}`;
            document.getElementById('averageValue').textContent = `Average Value for Selected Time Period: ${statistics[0].average_value}`;
        } else {
            document.getElementById('peakValue').textContent = "Peak Value for Selected Time Period: N/A";
            document.getElementById('averageValue').textContent = "Average Value for Selected Time Period: N/A";
        }
    })
    .catch(error => {
        console.error('Failed to fetch historical data:', error);
        alert('Failed to fetch historical data. Please check the console for more details.');
    });
    

    });
});
