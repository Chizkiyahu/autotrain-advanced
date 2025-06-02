document.addEventListener('DOMContentLoaded', function () {
    var fetchLogsInterval;
    var searchMatches = [];
    var currentMatchIndex = -1;

    // Function to check the modal's display property and fetch logs if visible
    function fetchAndDisplayLogs() {
        var modal = document.getElementById('logs-modal');
        var displayStyle = window.getComputedStyle(modal).display;

        // Check if the modal display property is 'flex'
        if (displayStyle === 'flex') {
            fetchLogs(); // Initial fetch when the modal is opened

            // Clear any existing interval to avoid duplicates
            clearInterval(fetchLogsInterval);

            // Set up the interval to fetch logs every 5 seconds
            fetchLogsInterval = setInterval(fetchLogs, 5000);
        } else {
            // Clear the interval when the modal is not displayed as 'flex'
            clearInterval(fetchLogsInterval);
        }
    }

    function highlightMatch(index) {
        var logContainer = document.getElementById('logContent');
        logContainer.querySelectorAll('.bg-yellow-200').forEach(el => {
            el.classList.remove('bg-yellow-200');
        });
        if (searchMatches.length === 0) return;
        var el = searchMatches[index];
        el.classList.add('bg-yellow-200');
        el.scrollIntoView({ block: 'center' });
    }

    function updateSearchResults() {
        var query = document.getElementById('logSearchInput').value.toLowerCase();
        searchMatches = [];
        currentMatchIndex = -1;
        var logContainer = document.getElementById('logContent');
        var logElements = logContainer.querySelectorAll('p');
        logElements.forEach(el => {
            el.classList.remove('bg-yellow-200');
            if (query && el.textContent.toLowerCase().includes(query)) {
                searchMatches.push(el);
            }
        });
        if (searchMatches.length > 0) {
            currentMatchIndex = 0;
            highlightMatch(currentMatchIndex);
        }
    }

    // Function to fetch logs from the server
    function fetchLogs() {
        fetch('/ui/logs')
            .then(response => response.json())
            .then(data => {
                var logContainer = document.getElementById('logContent');
                logContainer.innerHTML = '';

                if (typeof data.logs === 'string') {
                    logContainer.textContent = data.logs;
                } else {
                    data.logs.forEach(log => {
                        if (log.trim().length > 0) {
                            var p = document.createElement('p');
                            p.textContent = log;
                            if (log.toLowerCase().includes('error')) {
                                p.classList.add('text-red-600', 'dark:text-red-400');
                            }
                            logContainer.appendChild(p);
                        }
                    });
                }
                updateSearchResults();
            })
            .catch(error => console.error('Error fetching logs:', error));
    }

    // Set up an observer to detect when the modal becomes visible or hidden
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                fetchAndDisplayLogs();
            }
        });
    });

    var modal = document.getElementById('logs-modal');
    observer.observe(modal, {
        attributes: true //configure it to listen to attribute changes
    });

    document.getElementById('logSearchInput').addEventListener('input', updateSearchResults);
    document.getElementById('logNextBtn').addEventListener('click', function () {
        if (searchMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
        highlightMatch(currentMatchIndex);
    });
    document.getElementById('logPrevBtn').addEventListener('click', function () {
        if (searchMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        highlightMatch(currentMatchIndex);
    });
});
