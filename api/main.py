from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
app.include_router(inventario.router)
@app.get("/")
def root():
    return {"message": "CarryBot API funcionando"}
