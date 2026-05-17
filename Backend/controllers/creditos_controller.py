# controllers/creditos_controller.py
from services.creditos_service import CreditosService

service = CreditosService()

class CreditosController:

    async def obtener_bandeja(self, estado: str = None) -> dict:
        solicitudes = service.obtener_bandeja(estado)
        return {"success": True, "data": solicitudes}

    async def obtener_detalle(self, solicitud_id: str) -> dict:
        solicitud = service.obtener_detalle(solicitud_id)
        if not solicitud:
            return {"success": False, "message": "Solicitud no encontrada"}
        return {"success": True, "data": solicitud}

    async def evaluar(self, solicitud_id: str) -> dict:
        resultado = service.evaluar_solicitud(solicitud_id)
        return {"success": True, "data": resultado, "message": "Solicitud en evaluación"}

    async def aprobar(self, solicitud_id: str, comentario: str = None) -> dict:
        resultado = service.aprobar_solicitud(solicitud_id, comentario)
        return {"success": True, "data": resultado, "message": "Solicitud aprobada"}

    async def rechazar(self, solicitud_id: str, comentario: str = None) -> dict:
        resultado = service.rechazar_solicitud(solicitud_id, comentario)
        return {"success": True, "data": resultado, "message": "Solicitud rechazada"}

    async def desembolsar(self, solicitud_id: str) -> dict:
        resultado = service.desembolsar_solicitud(solicitud_id)
        return {"success": True, "data": resultado, "message": "Crédito desembolsado"}

    async def reporte(self) -> dict:
        datos = service.obtener_reporte()
        return {"success": True, "data": datos}

    async def desembolsos_hoy(self) -> dict:
        datos = service.obtener_desembolsos_hoy()
        return {"success": True, "data": datos}