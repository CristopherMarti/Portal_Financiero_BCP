import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
# Al inicio de cada repository
supabase = create_client(
    os.getenv("SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_KEY")  # ← service role, no anon
)

class DashboardRepository:

    def obtener_cuentas(self, user_id: str) -> list:
        """Obtiene todas las cuentas del usuario."""
        response = supabase.table("cuentas") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("tipo") \
            .execute()
        return response.data

    def obtener_ultimas_transacciones(self, user_id: str, limite: int = 5) -> list:
        """Obtiene las últimas N transacciones del usuario."""
        response = supabase.table("transacciones") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("fecha", desc=True) \
            .limit(limite) \
            .execute()
        return response.data