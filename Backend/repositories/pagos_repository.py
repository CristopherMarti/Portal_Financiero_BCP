import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

class PagosRepository:

    def obtener_historial(self, user_id: str, limite: int = 10) -> list:
        response = supabase.table("pagos") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("Fecha", desc=True) \
            .limit(limite) \
            .execute()
        return response.data

    def insertar_pago(self, datos: dict) -> dict:
        response = supabase.table("pagos").insert({
            "user_id":         str(datos["user_id"]),
            "Servicio":        datos["servicio"],
            "numero_contrato": datos["numero_contrato"],
            "Monto":           datos["monto"],
            "Estado":          "completado"
        }).execute()
        return response.data[0]