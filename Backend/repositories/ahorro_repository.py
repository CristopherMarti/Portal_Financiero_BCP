import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

class AhorroRepository:

    def obtener_cuenta_ahorro(self, user_id: str) -> dict:
        """Obtiene la cuenta de ahorro del usuario desde cuentas_ahorro."""
        response = supabase.table("cuentas_ahorro") \
            .select("*") \
            .eq("user_id", user_id) \
            .limit(1) \
            .execute()
        return response.data[0] if response.data else None

    def obtener_cuenta_ahorro_detalle(self, user_id: str) -> dict:
        """Obtiene el detalle de la cuenta tipo ahorro desde cuentas."""
        response = supabase.table("cuentas") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("tipo", "ahorro") \
            .limit(1) \
            .execute()
        return response.data[0] if response.data else None

    def obtener_movimientos(self, user_id: str, cuenta_id: str, limite: int = 10) -> list:
        """Obtiene los movimientos de la cuenta de ahorro."""
        response = supabase.table("transacciones") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("cuenta_id", cuenta_id) \
            .order("fecha", desc=True) \
            .limit(limite) \
            .execute()
        return response.data