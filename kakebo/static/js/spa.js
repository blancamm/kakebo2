const categorias = {
    CU: 'Cultura',
    SU : 'Supervivencia',
    OV: 'Ocio-vicio',
    EX: 'Extra'
}

let losMovimientos //para que sea global, y se guarde

xhr = new XMLHttpRequest

function RecibeRespuesta() { //LO DE ABAJO ES LO DE 4 Y ALGUNA DE LAS DOS OPCIONES
    if (this.readyState ===4 &&  (this.status === 200 || this.status === 201)) {
        const respuesta = JSON.parse(this.responseText)



        if (respuesta.status !== 'success') {
            alert ("Se ha producido un error en acceso al servidor" + respuesta.mensaje)
            return
        }

        alert(respuesta.mensaje)

        llamaMovimientos()
    }
}


function detallaMovimiento(id) {

    // la forma simplificada: 
    // movimiento = losMovimientos.filter(item => item.id == id) [0]

    let movimiento
    for (let i=0; i< losMovimientos.length; i++) {
        const item=losMovimientos[i]
        if (item.id == id) {
            movimiento = item
            break //para que se pare nada más encontrarlo
        }
    }

    if(!movimiento) return //si no lo consigue se sale

    document.querySelector('#idMovimiento').value = id

    document.querySelector("#fecha").value=movimiento.fecha
    document.querySelector("#concepto").value=movimiento.concepto
    document.querySelector("#categoria").value=movimiento.categoria
    document.querySelector("#cantidad").value=movimiento.cantidad.toFixed(2) //para que te salgan solo dos decimales
    if( movimiento.esGasto == 1) {
        document.querySelector("#gasto").checked = true
    } else {
        document.querySelector("#ingreso").checked = true
    }
}

//TENGO QUE DEFINIR ANTES LAS FUNCIONES QUE LLAMARÉ LUEGO
function muestraMovimientos() {
    if (this.readyState === 4 && this.status === 200) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en la consulta de movimientos")
            return
        }

        losMovimientos=respuesta.movimientos
        const tbody = document.querySelector(".tabla-movimientos tbody")
        tbody.innerHTML="" //para que se borre lo que tenia en la pantalla cada vez que modifico un registro

        for (let i=0; i< respuesta.movimientos.length; i++) {
            const movimiento = respuesta.movimientos[i]
            const fila = document.createElement("tr")
            fila.addEventListener("click", ()=> detallaMovimiento(movimiento.id)) //cuando se produzca el evento, se lleva a cabo esa funcion

            const dentro = `
                <td>${movimiento.fecha}</td>
                <td>${movimiento.concepto}</td>
                <td>${movimiento.esGasto ? "Gasto" : "Ingreso"}</td>
                <td>${movimiento.categoria ? categorias[movimiento.categoria] : ""}</td>
                <td>${movimiento.cantidad} €</td>
            `
            fila.innerHTML= dentro
            
            tbody.appendChild(fila)

        }
    }
}

function DatosFormulario() {
    const movimiento= {}

    movimiento.fecha= document.querySelector("#fecha").value
    movimiento.concepto=document.querySelector("#concepto").value
    movimiento.categoria=document.querySelector("#categoria").value
    movimiento.cantidad = document.querySelector("#cantidad").value
    if(document.querySelector("#gasto").checked) {
        movimiento.esGasto=1
    } else {
        movimiento.esGasto= 0
    }

    return movimiento
}

function Validar(movimiento) {
    if (!movimiento.fecha) {
        alert ("fecha incorrecta")
        return false
    }

    if (movimiento.concepto === "") {
        alert("concepto obligatorio")
        return false
    }

    if (!document.querySelector('#gasto').checked && !document.querySelector('#ingreso').checked) {
        alert ("Elija tipo de movimiento")
        return false
    }

    if (movimiento.esGasto && !movimiento.categoria) {
        alert("un ingreso debe tener categoria")
        return false
    }
    if (!movimiento.esGasto && movimiento.categoria) {
        alert("Un ingreso no puede tener categoria")
        return false
    }

    if (movimiento.cantidad <= 0) {
        alert ("La cantidad debe ser positiva")
        return false
    }

    return true
    
}

function llamaMovimientos() { 
    xhr.open('GET', `http://localhost:5000/api/v1/movimientos`, true)
    xhr.onload = muestraMovimientos
    xhr.send()
}

function llamaModificar(evento) {
    evento.preventDefault() //mirarte que era esto

    id=document.querySelector('#idMovimiento').value
    if (!id) {
        alert("Selecciona un movimiento antes")
    }

    const movimiento =DatosFormulario()

    if (!Validar(movimiento)) {
        return
    }


    xhr.open("PUT", `http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = RecibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    xhr.send(JSON.stringify(movimiento)) //la respuesta era un jsonnify con un diccionario de status de success y mensaje de registro modificado

}
    
function llamaBorraMovimiento(evento) {
    evento.preventDefault()
    id=document.querySelector('#idMovimiento').value

    if (!id) {
        alert("Selecciona un movimiento antes")
    }

    xhr.open("DELETE", `http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = RecibeRespuesta 
    xhr.send()
}

function llamaNuevoMovimiento(evento) {
    evento.preventDefault() //mirarte que era esto
    const movimiento =DatosFormulario()

    if (!Validar(movimiento)) {
        return
    }
    
    xhr.open("POST", `http://localhost:5000/api/v1/movimiento`, true)
    xhr.onload = RecibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    xhr.send(JSON.stringify(movimiento))
    
}
//cuando la pagina ya este cargada(el html) hazme todo esto:
window.onload =function(){ //Se pone esto para que el css y el js sea lo ultimo en cargarse aunque esten al principio del html
    llamaMovimientos()

    document.querySelector("#modificar")
        .addEventListener("click", llamaModificar)

    document.querySelector("#eliminar")
        .addEventListener("click", llamaBorraMovimiento) //siN parentesis porque solo se hace la funcion CUANDO SE HAGA EL EVENTO, NO CUANDO SE DEFINE

    document.querySelector('#nuevo')
        .addEventListener("click", llamaNuevoMovimiento)
}
    