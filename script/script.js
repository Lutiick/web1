const SCRIPT_URL = "script/form.php";
var timestamp = 0;
jQuery(document).ready(function ($) {

// Функции валидации инпутов
function checkXvalid() {
    let val = $("#xcord").val()
    val = val.replace(/[^(0-9\-)]+/g, "") // Убирает все символы кроме [цифр -]
    if (val != "-") {
        while(val && !(parseInt(val) <= 5 && parseInt(val) >= -3)) {
            val = val.slice(0, -1)
        }
    }
    $("#xcord").val(val)
}

function checkYvalid() {
    let val = $("#ycord").val()
    val = val.replace(/[^(0-9\.\,\-)]+/g, "") // Убирает все символы кроме [цифр . , -]
    val = val.replace(/[\.\,]{1,}/, '.'); // Заменяет все точки и запятые на одну точку
    val = val.replace(/(?<=(.+\..+))(.+)/, '') // Убирает все точки поставленные после первой
    val = val.replace(/(?<=(.+))(-+)/, '') // Убирает все лишние минусы
    if (val != "-") {
        while(val && !(parseFloat(val) <= 3 && parseFloat(val) >= -5)) {
            val = val.slice(0, -1)
        }
    }
    
    $("#ycord").val(val)
}

//Добавление строки таблицы
function addTableRow(json) {
    json = JSON.parse(json);
    let x = parseInt(json["x"]);
    let y = parseFloat(json["y"]).toFixed(2);
    let r = parseFloat(json["r"]).toFixed(1);
    let hit = parseInt(json["hit"]);
    let hit_text = parseInt(json["hit"]) ? "Попадание" : "Промах";
    let newRow = `
        <tr class="hit${hit}">
            <td>(${x}, ${y})</td>
            <td>${r}</td>
            <td>${json["script_time"]}ms</td>
            <td>${json["current_time"]}</td>
            <td>${hit_text}</td>
        </tr>
    `;
    $("#result-table tbody").append(newRow);
}

// Добавление точки на график
function addSvgCircle(json) {
    json = JSON.parse(json);
    let delta_x = 200; // центр графика
    let delta_y = 200; // центр графика
    let delta_r = 158; // длина R
    let x = parseFloat(json["x"]);
    let y = parseFloat(json["y"]);
    let r = parseFloat(json["r"]);
    let hit = parseInt(json["hit"]);
    let color = hit ? "green" : "red";

    let svg = document.getElementById('graph')
                        .contentDocument
                        .getElementById("graphsvg");
    let newCircle = `
    <circle
        xmlns="http://www.w3.org/2000/svg"
        class="ad-cirle"
        cx="${(x / r) * delta_r + delta_x}"
        cy="${(-y / r) * delta_r + delta_y}"
        fill="${color}"
        r="5"/>
    `;

    $(svg).append(newCircle);
}

// Функция загрузки таблицы и графика из локального хранилища
function loadTableGraph() {
    if (localStorage.length > 0)
        for (let i = 0; i < localStorage.length; i++) {
            let data = localStorage.getItem(i);
            addTableRow(data);
            addSvgCircle(data);
        }
}

//Функция очистки
function reset() {
    localStorage.clear();
    $("#result-table tbody").html("");
    let svg = document.getElementById('graph')
                        .contentDocument
                        .getElementById("graphsvg");
    $(svg).find(".ad-cirle").remove()
}

// Функции работы с сервером
function onAnswer(res) {
    timestamp = Date.now() - timestamp;
    if ("error" in res) {
        $("#error-box").text("Ошибочка вышла, отправте нормально данные через форму")
    } else {
        res["script_time"] = timestamp;
        let json = JSON.stringify(res);
        addTableRow(json);
        addSvgCircle(json);
        localStorage.setItem(localStorage.length, json)
    }
}

function sendData() {
    let xval = $('#xcord').val();
    let yval = $("#ycord").val();
    let rval = $('input[name="radio"]:checked').val();
    $("#error-box").text("");
    if (xval == "" || yval == "" || rval == "") {
        $("#error-box").text("Ошибка! Заполните все поля");
    } else {
        timestamp = Date.now();
        $.ajax({
            type: "GET",
            url: SCRIPT_URL,
            data: {
                "x": xval,
                "y": yval,
                "r": rval,
                "time": (new Date()).getTimezoneOffset()
            },
            success: onAnswer,
            error: (resp, e) => {
                $("#error-box").text("Непредвиденная ошибка");
            },
            dataType: "json"
        })
    }
    return false;
}

$("#xcord").on("input", checkXvalid);
$("#ycord").on("input", checkYvalid);
$("#form").on("submit", sendData);
$("#reset").on("click", reset);
window.onload = () => {
    loadTableGraph();
}
    
});