from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import usuarios, tareas, robots
from api.routers import incidencias
from api.routers import alertas
from api.routers import usuarios, inventario

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(tareas.router)
app.include_router(robots.router)
app.include_router(incidencias.router)
app.include_router(alertas.router)
app.include_router(inventario.router)

@app.get("/")
def root():
    return {"message": "CarryBot API funcionando"}
