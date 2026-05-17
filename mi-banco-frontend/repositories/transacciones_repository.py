import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
# Al inicio de cada repository
supabase = create_client(
    os.getenv("SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_KEY")  # ← service role, no anon
)

class TransaccionesRepository:

    def obtener_transacciones(
        self,
        user_id: str,
        tipo: str = None,
        desde: str = None,
        hasta: str = None,
        limite: int = 20
    ) -> list:
        """Obtiene transacciones con filtros opcionales."""
        query = supabase.table("transacciones") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("fecha", desc=True) \
            .limit(limite)

        if tipo:
            query = query.eq("tipo", tipo)
        if desde:
            query = query.gte("fecha", desde)
        if hasta:
            query = query.lte("fecha", hasta + "T23:59:59")

        return query.execute().data