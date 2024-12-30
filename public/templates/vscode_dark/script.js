// Simulate VS Code latency indicator
document.addEventListener('DOMContentLoaded', () => {
    const latencyElement = document.querySelector('.latency');
    if (!latencyElement) return;

    function updateLatency() {
        const baseLatency = 200;
        const variation = Math.random() * 100;
        const latency = Math.round(baseLatency + variation);
        latencyElement.textContent = `${latency}ms`;

        // Add color classes based on latency
        latencyElement.className = 'latency';
        if (latency < 250) {
            latencyElement.style.color = '#3fba50';
        } else if (latency < 350) {
            latencyElement.style.color = '#dcdcaa';
        } else {
            latencyElement.style.color = '#f14c4c';
        }
    }

    // Update latency every 2 seconds
    updateLatency();
    setInterval(updateLatency, 2000);
});