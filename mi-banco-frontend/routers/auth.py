# routers/auth.py
from fastapi import APIRouter, HTTPException
from controllers.auth_controller import AuthController
from models.schemas import LoginRequest, RegistroRequest

router     = APIRouter()
controller = AuthController()

# POST /api/auth/registro
@router.post("/registro", summary="Registrar nuevo usuario")
async def registro(datos: RegistroRequest):
    try:
        return await controller.registro(datos)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# POST /api/auth/login
@router.post("/login", summary="Iniciar sesión")
async def login(datos: LoginRequest):
    try:
        return await controller.login(datos)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# POST /api/auth/logout
@router.post("/logout", summary="Cerrar sesión")
async def logout(datos: dict):
    try:
        return await controller.logout(datos.get("access_token"))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))