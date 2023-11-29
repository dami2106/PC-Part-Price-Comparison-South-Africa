document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let searchTerm = document.getElementById('search-input').value;

    if (searchTerm.trim() !== '') {
        fetch('search.php?term=' + encodeURIComponent(searchTerm))
            .then(response => response.json())
            .then(data => {
                displayResults(data);
            })
            .catch(error => console.error('Error:', error));
    }
});

function displayResults(results) {
    let resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (results.length > 0) {
        results.forEach(result => {
            let resultItem = document.createElement('p');
            resultItem.textContent = result;
            resultsContainer.appendChild(resultItem);
        });
    } else {
        resultsContainer.textContent = 'No results found.';
    }
}
