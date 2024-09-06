import pandas as pd
from sqlalchemy import create_engine, inspect
from database import SQLALCHEMY_DATABASE_URL

# Crear la conexión a la base de datos
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Función para obtener todos los nombres de las tablas
def get_table_names():
    inspector = inspect(engine)
    return inspector.get_table_names()

# Función para exportar una tabla a CSV
def export_table_to_csv(table_name, file_path):
    df = pd.read_sql_table(table_name, engine)
    df.to_csv(file_path, index=False)
    print(f"Tabla '{table_name}' exportada a '{file_path}'")

# Exportar todas las tablas
table_names = get_table_names()
for table in table_names:
    export_table_to_csv(table, f"{table}.csv")

print("Exportación completada.")