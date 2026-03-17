<?php
$message = 'Hello, Docker PHP with Apache!';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PHP Apache Docker</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "Trebuchet MS", sans-serif;
      background: linear-gradient(135deg, #fff7ed, #fde68a);
      color: #7c2d12;
    }

    .card {
      width: min(620px, calc(100% - 32px));
      padding: 36px 30px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 18px 50px rgba(124, 45, 18, 0.18);
      text-align: center;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(30px, 6vw, 48px);
    }

    p {
      margin: 0;
      font-size: 18px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1><?php echo $message; ?></h1>
    <p>This PHP page is running with Apache inside Docker.</p>
  </main>
</body>
</html>
