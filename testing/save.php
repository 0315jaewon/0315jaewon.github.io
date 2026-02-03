<?php
if (isset($_POST['task'])) {
    $task = htmlspecialchars($_POST['task']); // Sanitize input
    $file = 'tasks.txt';
    
    // Append the new task to the file
    file_put_contents($file, $task . PHP_EOL, FILE_APPEND);

    // Redirect back to the main page
    header('Location: index.html');
    exit;
}
?>
