# repositories/prestamo_repository.py
# REPOSITORY: abstrae el acceso a la base de datos (Supabase)
# El Service NO conoce cómo se conecta a la BD, solo llama al Repository
# Equivalente a JpaRepository en Spring Boot o Eloquent en Laravel
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
# Al inicio de cada repository
supabase = create_client(
    os.getenv("SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_KEY")  # ← service role, no anon
)
class PrestamoRepository:

    def insertar_solicitud(self, datos: dict) -> dict:
        """Inserta una solicitud de préstamo en la tabla 'solicitudes_prestamo'."""
        response = supabase.table("solicitudes_prestamo").insert({
            "user_id":       str(datos["user_id"]),
            "monto":         datos["monto"],
            "plazo_meses":   datos["plazo_meses"],
            "tasa_anual":    datos["tasa_anual"],
            "cuota_mensual": datos["cuota_mensual"],
            "proposito":     datos["proposito"],
            "estado":        "pendiente"
        }).execute()
        return response.data[0]

    def obtener_solicitudes_por_usuario(self, user_id: str) -> list:
        """Obtiene todas las solicitudes de un usuario."""
        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    


#------------------------

     #mejora el código para evitar que se creen solicitudes duplicadas por doble click en el frontend
    def buscar_solicitud_reciente(
        self,
        user_id: str,
        monto: float,
        plazo_meses: int,
        segundos: int = 360
    ) -> dict:
        """
        Busca si ya existe una solicitud idéntica del mismo usuario
        en los últimos N segundos. Previene doble registro por doble click.
        El Repository es quien consulta Supabase — el Service no accede a BD.
        """
        from datetime import datetime, timedelta, timezone

        desde = (
            datetime.now(timezone.utc) - timedelta(seconds=segundos)
        ).isoformat()

        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("monto", monto) \
            .eq("plazo_meses", plazo_meses) \
            .gte("created_at", desde) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        return response.data[0] if response.data else None

#------------------------









    def obtener_solicitud_por_id(self, solicitud_id: str) -> dict:
        """Obtiene una solicitud específica por su ID."""
        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .eq("id", solicitud_id) \
            .execute()
        if not response.data:
            return None
        return response.data[0]

    def eliminar_solicitud(self, solicitud_id: str) -> bool:
        """Elimina una solicitud que esté en estado 'pendiente'."""
        response = supabase.table("solicitudes_prestamo") \
            .delete() \
            .eq("id", solicitud_id) \
            .eq("estado", "pendiente") \
            .execute()
        return len(response.data) > 0