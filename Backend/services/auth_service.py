# services/auth_service.py
from repositories.auth_repository import AuthRepository

class AuthService:

    def __init__(self):
        self.repository = AuthRepository()

    def registrar_usuario(self, email: str, password: str, nombre: str) -> dict:
        """
        Registra un usuario en Supabase Auth y crea sus cuentas demo.
        """
        # Verificar si el email ya existe
        existente = self.repository.buscar_usuario_por_email(email)
        if existente:
            raise ValueError("Este correo ya está registrado.")

        # Crear usuario en Supabase Auth
        usuario = self.repository.crear_usuario(email, password, nombre)
        if not usuario:
            raise ValueError("Error al crear el usuario.")

        # Crear cuentas demo automáticamente
        self.repository.crear_cuentas_demo(usuario["id"])

        return {
            "user_id": usuario["id"],
            "email":   usuario["email"],
            "nombre":  nombre
        }

    def iniciar_sesion(self, email: str, password: str) -> dict:
        """
        Inicia sesión y devuelve el token de acceso.
        """
        resultado = self.repository.login(email, password)
        if not resultado:
            raise ValueError("Correo o contraseña incorrectos.")

        return {
            "access_token":  resultado["access_token"],
            "refresh_token": resultado["refresh_token"],
            "user_id":       resultado["user"]["id"],
            "email":         resultado["user"]["email"],
            "nombre":        resultado["user"].get("user_metadata", {}).get("full_name", "")
        }

    def cerrar_sesion(self, access_token: str) -> None:
        """
        Cierra la sesión invalidando el token.
        """
        if not access_token:
            raise ValueError("Token requerido.")
        self.repository.logout(access_token)