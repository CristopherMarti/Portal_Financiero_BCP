# repositories/auth_repository.py
import os
import random
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

class AuthRepository:

    def buscar_usuario_por_email(self, email: str) -> dict:
        """Busca si ya existe un usuario con ese email."""
        try:
            response = supabase.auth.admin.list_users()
            for user in response:
                if user.email == email:
                    return {"id": user.id, "email": user.email}
            return None
        except Exception:
            return None

    def crear_usuario(self, email: str, password: str, nombre: str) -> dict:
        """Crea el usuario en Supabase Auth."""
        try:
            response = supabase.auth.admin.create_user({
                "email":            email,
                "password":         password,
                "email_confirm":    True,
                "user_metadata":    {"full_name": nombre}
            })
            return {"id": response.user.id, "email": response.user.email}
        except Exception as e:
            raise ValueError(f"Error al crear usuario: {str(e)}")

    def login(self, email: str, password: str) -> dict:
        """Inicia sesión con email y contraseña."""
        try:
            response = supabase.auth.sign_in_with_password({
                "email":    email,
                "password": password
            })
            return {
                "access_token":  response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "user":          {
                    "id":            response.user.id,
                    "email":         response.user.email,
                    "user_metadata": response.user.user_metadata
                }
            }
        except Exception:
            return None

    def logout(self, access_token: str) -> None:
        """Cierra la sesión del usuario."""
        try:
            supabase.auth.sign_out()
        except Exception:
            pass

    def crear_cuentas_demo(self, user_id: str) -> None:
        """Crea cuentas y transacciones de demo para el usuario nuevo."""
        num_cc = f"019-{random.randint(1000000, 9999999)}"
        num_ca = f"019-{random.randint(1000000, 9999999)}"

        # Cuenta corriente
        cc = supabase.table("cuentas").insert({
            "user_id":       user_id,
            "tipo":          "corriente",
            "numero_cuenta": num_cc,
            "saldo":         4250.00,
            "moneda":        "PEN"
        }).execute()

        # Cuenta ahorro en tabla cuentas
        ca = supabase.table("cuentas").insert({
            "user_id":       user_id,
            "tipo":          "ahorro",
            "numero_cuenta": num_ca,
            "saldo":         12875.50,
            "moneda":        "PEN"
        }).execute()

        cc_id = cc.data[0]["id"]
        ca_id = ca.data[0]["id"]

        # Detalle de ahorro
        supabase.table("cuentas_ahorro").insert({
            "user_id":        user_id,
            "tipo":           "ahorro",
            "numero_cuenta":  num_ca,
            "saldo":          12875.50,
            "tasa_interes":   3.5,
            "fecha_apertura": "2024-01-15",
            "activa":         True,
            "meta_ahorro":    20000.00
        }).execute()

        # Transacciones de ejemplo
        supabase.table("transacciones").insert([
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "debito",  "descripcion": "Pago servicio agua SEDAPAL",   "monto": 85.00},
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "credito", "descripcion": "Transferencia recibida",        "monto": 500.00},
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "debito",  "descripcion": "Compra supermercado WONG",      "monto": 230.50},
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "debito",  "descripcion": "Pago Netflix",                  "monto": 39.90},
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "credito", "descripcion": "Depósito sueldo",               "monto": 3500.00},
            {"user_id": user_id, "cuenta_id": ca_id, "tipo": "credito", "descripcion": "Depósito ahorro programado",    "monto": 1000.00},
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "debito",  "descripcion": "Pago luz ENEL",                 "monto": 120.00},
            {"user_id": user_id, "cuenta_id": cc_id, "tipo": "credito", "descripcion": "Devolución compra",             "monto": 150.00},
        ]).execute()