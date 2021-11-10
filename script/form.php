<?php

function validateX($x) {
    $x_max = 5;
    $x_min = -5;

    if (!isset($x))
        return false;

    $numX = str_replace(',', '.', $x);
    return is_numeric($numX) && $numX >= $x_min && $numX <= $x_max;
}

function validateY($y) {
    $y_max = 3;
    $y_min = -5;

    if (!isset($y))
        return false;

    $numY = str_replace(',', '.', $y);
    return is_numeric($numY) && $numY >= $y_min && $numY <= $y_max;
}

function validateR($r) {
    return isset($r);
}

function validate($x, $y, $r) {
    return validateX($x)&&validateY($y)&&validateR($r);
}

function checkTriangle($x, $y, $r) {
    return $x >= 0 && $y <= 0 && $y - $x >= -$r;
}

function checkRectangle($x, $y, $r) {
    return $x >= 0 && $y >= 0 && $x <= $r && $y <= $r;
}

function checkCircle($x, $y, $r) {
    return $x <= 0 && $y >= 0 && $x*$x+$y*$y <= $r*$r/4;
}

function checkHit($x, $y, $r) {
    return checkTriangle($x, $y, $r) || checkRectangle($x, $y, $r)||checkCircle($x, $y, $r);
}

$r = (float)$_GET["r"];
$x = (float)$_GET["x"];
$y = (float)$_GET["y"];
$isValid = validate($x, $y, $r);
$current_time = date('H:i:s', time()-$_GET['time']*60);

$format_success = '
            {
                "x": "%d",
                "y": "%f",
                "r": "%f",
                "current_time": "%s",
                "hit": "%s"
            }
        ';
$format_error = '
            {
                "error": "%s"
            }
        ';

$jsonData = "";
if ($isValid) {
    $hit = checkHit($x, $y, $r) ? 1 : 0;
    $jsonData = sprintf($format_success, $x, $y, $r, $current_time, $hit);
} else {
    $jsonData = sprintf($format_error, "Невалидные данные");
}

header('Access-Control-Allow-Origin: *');
echo $jsonData;