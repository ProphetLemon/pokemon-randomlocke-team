function buscar() {
    var nombre = $("#nombrePokemon")[0].value
    if (nombre) {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $("#imagen")[0].innerHTML = "<b>Cargando...</b>"
        $.post("/pokemon", { nombre: nombre }, function (result) {
            $("#imagen")[0].innerHTML = result
            $(".evolucion").click(function (e) {
                $("#nombrePokemon")[0].value = e.currentTarget.outerText
                buscar()
            })
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