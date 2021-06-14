const categorias = {
    CU: 'Cultura',
    SU : 'Supervivencia',
    OV: 'Ocio-vicio',
    EX: 'Extra'
}

let losMovimientos //para que sea global, y se guarde


function detallaMovimiento(id) {

    // la forma simplificada: 
    // movimiento = losMovimientos.filter(item => item.id == id) [0]

    let movimiento
    for (let i=0; i< losMovimientos.length; i++) {
        const item=losMovimientos[i]
        if (item.id == id) {
            movimiento = item
            break
        }
    }

    if(!movimiento) return

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
            const tbody = document.querySelector(".tabla-movimientos tbody")
            tbody.appendChild(fila)

        }
    }
}



xhr = new XMLHttpRequest
xhr.onload = muestraMovimientos

function llamaMovimientos() { 
    xhr.open('GET', `http://localhost:5000/api/v1/movimientos`, true)
    xhr.send()
}


//cuando la pagina ya este cargada(el html) hazme todo esto:
window.onload =function(){ //Se pone esto para que el css y el js sea lo ultimo en cargarse aunque esten al principio del html
    llamaMovimientos()
    document.querySelector("#modificar")
        .addEventListener("click", (evento) => {
            evento.preventDefault() //mirarte que erea esto
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

            id=document.querySelector('#idMovimiento')

            xhr.open("PUT", `http://localhost:5000/api/v1/movimiento/${id}`, true)
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

        })
    
}