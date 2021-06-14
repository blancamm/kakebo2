import sqlite3
from kakebo import app
from kakebo.dataaccess import DBmanager
from flask import jsonify, render_template, request
from http import HTTPStatus


dbManager = DBmanager(app.config.get('DATABASE'))

@app.route('/')
def listaMovimientos():
    return render_template('spa.html') #esto es todo el trabajo que hace el servidor, el resto lo hace el navegador con el spa.html
    #es decir el servidor te ha el html y los datos de la base da datos. El hecho de modificar, añadir, eliminar movimientos se hara en el naveagador
    #con el spa.js junto al html

@app.route('/api/v1/movimientos')  #v1=version 1
def movimientos():
    query = "SELECT * FROM movimientos ORDER BY fecha;"

    try:
        lista= dbManager.consultaMuchasSQL(query)
        return jsonify({'status': 'success', 'movimientos': lista})
        
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)}) #SE TRANSFORMA ES CADENA DE ETXTO QUE SE PUEDE ENVIAR POR INTERNET PARA JAVASCRIPT GRACIAS JSONFY

@app.route('/api/v1/movimiento/<int:id>', methods= ['GET', 'PUT', 'DELETE'])
@app.route('/api/v1/movimiento', methods=['POST']) #porque cuando hago un post creo id, no necesito id
def detalleMovimiento(id=None):
    try:
        if request.method in ('GET', 'PUT', 'DELETE'):
            movimiento = dbManager.consultaUnaSQL ("SELECT *FROM movimientos WHERE id = ?", [id]) #primero lo cojo, el movimiento.


        if request.method == 'GET':
            if movimiento:
                return jsonify({
                "status": "success",
                "movimiento": movimiento
                })
            else:
                return jsonify({"status":"fail", "mensaje": "movimiento no encontrado"}), 404 #para decir que no se encuentra(es el codigo 404 el que lo indica)

        if request.method == 'PUT': #los dos puntos significa que son las claves del diccionario
            dbManager.modificaSQL("""UPDATE movimientos SET 
            fecha=:fecha, concepto=:concepto, esGasto=:esGasto, categoria=:categoria, cantidad=:cantidad 
            WHERE id={}""".format(id), request.json)

            return jsonify({"status": "success", "mensaje": "registro modificado"}) #por defecto nos devuelve el 200
    
        if request.method == 'DELETE':
            dbManager.modificaSQL("DELETE FROM movimientos WHERE id = ?", [id])

            return jsonify({"status":"success", "mensaje": "registro borrado"})
        
        if request.method == 'POST':
            dbManager.modificaSQL("""
            INSERT INTO movimientos 
            (fecha, concepto, esGasto, categoria, cantidad)
            VALUES (:fecha, :concepto, :esGasto, :categoria, :cantidad) 
            """, request.json)

            return jsonify({"status": "success", "mensaje": "El movimiento se ha creado correctamente"}), HTTPStatus.CREATED

    except sqlite3.Error as e:
        return jsonify({"status":"fail", "mensaje":"Error en base de datos {}".format(e)}), HTTPStatus.BAD_REQUEST