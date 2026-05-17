from services.pagos_service import PagosService

service = PagosService()

class PagosController:

    async def obtener_historial(self, user_id: str) -> dict:
        historial = service.obtener_historial(user_id)
        return {"success": True, "data": historial}

    async def registrar_pago(self, datos: dict) -> dict:
        pago = service.registrar_pago(datos)
        return {"success": True, "data": pago}