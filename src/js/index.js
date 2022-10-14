function buscar() {
    var nombre = $("#nombrePokemon")[0].value
    if (nombre) {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $("#imagen")[0].innerHTML = "<b>Cargando...</b>"
        $.post("/pokemon", { nombre: nombre }, function (result) {
            $("#imagen")[0].innerHTML = result
        })
    } else {
        $("#imagen")[0].innerHTML = "<b>Escribe el nombre de un pokemon</b>"
    }
}

var input = document.getElementById("nombrePokemon");

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        buscar()
    }
});

function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}