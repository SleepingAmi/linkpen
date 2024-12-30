document.addEventListener('DOMContentLoaded', () => {
    // Update the "Last Updated" time
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        function updateTimeAgo() {
            const now = new Date();
            const minutes = Math.floor(Math.random() * 60);
            lastUpdatedElement.textContent = `${minutes}m ago`;
        }
        updateTimeAgo();
        setInterval(updateTimeAgo, 60000); // Update every minute
    }
    const latencyElement = document.querySelector('.time');
    if (!latencyElement) return;

    function updateLatency() {
        const baseLatency = 100;
        const variation = Math.random() * 100;
        const latency = Math.round(baseLatency + variation);
        latencyElement.textContent = `${latency}ms`;

        latencyElement.className = 'time';
        if (latency < 100) {
            latencyElement.classList.add('time-good');
        } else if (latency < 200) {
            latencyElement.classList.add('time-warning');
        } else {
            latencyElement.classList.add('time-high');
        }
    }

    updateLatency();
    setInterval(updateLatency, 2000);
});