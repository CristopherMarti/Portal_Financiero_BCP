from services.transacciones_service import TransaccionesService

service = TransaccionesService()

class TransaccionesController:

    async def obtener_transacciones(
        self,
        user_id: str,
        tipo: str = None,
        desde: str = None,
        hasta: str = None
    ) -> dict:
        resultado = service.obtener_transacciones(user_id, tipo, desde, hasta)
        return {"success": True, "data": resultado}