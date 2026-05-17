from services.dashboard_service import DashboardService

service = DashboardService()

class DashboardController:

    async def obtener_cuentas(self, user_id: str) -> dict:
        cuentas = service.obtener_cuentas(user_id)
        return {"success": True, "data": cuentas}

    async def obtener_resumen(self, user_id: str) -> dict:
        resumen = service.obtener_resumen(user_id)
        return {"success": True, "data": resumen}

    async def obtener_ultimas_transacciones(self, user_id: str) -> dict:
        txns = service.obtener_ultimas_transacciones(user_id)
        return {"success": True, "data": txns}