<?php

if (isset($_GET['term'])) {
    $searchTerm = $_GET['term'];

    // Load CSV data
    $csvFile = 'DreamWareTech.csv';
    $csvData = array_map('str_getcsv', file($csvFile));

    // Search logic
    $results = [];
    foreach ($csvData as $row) {
        foreach ($row as $value) {
            if (stripos($value, $searchTerm) !== false) {
                $results[] = $value;
            }
        }
    }

    // Return results as JSON
    header('Content-Type: application/json');
    echo json_encode($results);
}
