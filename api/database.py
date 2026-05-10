import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "robotika"
}

def get_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error al conectar con MySQL: {e}")
        return None

def execute_query(query: str, params: tuple = ()):
    connection = get_connection()
    if not connection:
        return None
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        connection.commit()
        return cursor
    except Error as e:
        print(f"Error al ejecutar query: {e}")
        return None
    finally:
        connection.close()

def fetch_query(query: str, params: tuple = ()):
    connection = get_connection()
    if not connection:
        return []
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        return cursor.fetchall()
    except Error as e:
        print(f"Error al ejecutar query: {e}")
        return []
    finally:
        connection.close()