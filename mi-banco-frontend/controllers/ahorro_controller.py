from services.ahorro_service import AhorroService

service = AhorroService()

class AhorroController:

    async def obtener_resumen(self, user_id: str) -> dict:
        resumen = service.obtener_resumen(user_id)
        return {"success": True, "data": resumen}

    async def obtener_movimientos(self, user_id: str, cuenta_id: str) -> dict:
        movimientos = service.obtener_movimientos(user_id, cuenta_id)
        return {"success": True, "data": movimientos}