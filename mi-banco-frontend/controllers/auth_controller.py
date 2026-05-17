# controllers/auth_controller.py
from models.schemas import LoginRequest, RegistroRequest
from services.auth_service import AuthService

service = AuthService()

class AuthController:

    async def registro(self, datos: RegistroRequest) -> dict:
        resultado = service.registrar_usuario(
            email    = datos.email,
            password = datos.password,
            nombre   = datos.nombre
        )
        return {"success": True, "data": resultado, "message": "Usuario registrado correctamente"}

    async def login(self, datos: LoginRequest) -> dict:
        resultado = service.iniciar_sesion(
            email    = datos.email,
            password = datos.password
        )
        return {"success": True, "data": resultado}

    async def logout(self, access_token: str) -> dict:
        service.cerrar_sesion(access_token)
        return {"success": True, "message": "Sesión cerrada correctamente"}