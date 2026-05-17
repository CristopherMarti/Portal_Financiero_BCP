# repositories/creditos_repository.py
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

class CreditosRepository:

    def obtener_todas_solicitudes(self) -> list:
        """Bandeja interna: todas las solicitudes sin filtro de usuario."""
        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()
        return response.data

    def obtener_solicitudes_por_estado(self, estado: str) -> list:
        """Filtra solicitudes por estado: pendiente, en_evaluacion, aprobado, rechazado, desembolsado."""
        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .eq("estado", estado) \
            .order("created_at", desc=True) \
            .execute()
        return response.data

    def obtener_solicitud_por_id(self, solicitud_id: str) -> dict:
        """Detalle de una solicitud específica."""
        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .eq("id", solicitud_id) \
            .execute()
        return response.data[0] if response.data else None

    def cambiar_estado(self, solicitud_id: str, nuevo_estado: str, comentario: str = None) -> dict:
        """
        Cambia el estado de una solicitud.
        Estados válidos: pendiente → en_evaluacion → aprobado/rechazado → desembolsado
        """
        payload = {"estado": nuevo_estado}
        if comentario:
            payload["comentario"] = comentario

        response = supabase.table("solicitudes_prestamo") \
            .update(payload) \
            .eq("id", solicitud_id) \
            .execute()
        return response.data[0] if response.data else None

    def obtener_reporte_cartera(self) -> dict:
        """Cuenta solicitudes agrupadas por estado para el reporte interno."""
        estados = ["pendiente", "en_evaluacion", "aprobado", "rechazado", "desembolsado"]
        reporte = {}
        total_monto = 0.0

        for estado in estados:
            res = supabase.table("solicitudes_prestamo") \
                .select("monto") \
                .eq("estado", estado) \
                .execute()
            reporte[estado] = {
                "cantidad": len(res.data),
                "monto_total": round(sum(float(r["monto"]) for r in res.data), 2)
            }
            total_monto += reporte[estado]["monto_total"]

        reporte["total_cartera"] = round(total_monto, 2)
        return reporte

    def obtener_desembolsos_hoy(self) -> list:
        """Solicitudes desembolsadas el día de hoy."""
        from datetime import date
        hoy = date.today().isoformat()

        response = supabase.table("solicitudes_prestamo") \
            .select("*") \
            .eq("estado", "desembolsado") \
            .gte("updated_at", f"{hoy}T00:00:00") \
            .execute()
        return response.data