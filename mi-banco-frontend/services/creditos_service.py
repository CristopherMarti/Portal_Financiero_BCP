# services/creditos_service.py
from repositories.creditos_repository import CreditosRepository

class CreditosService:

    def __init__(self):
        self.repository = CreditosRepository()

    def obtener_bandeja(self, estado: str = None) -> list:
        """Devuelve todas las solicitudes o filtra por estado."""
        if estado:
            return self.repository.obtener_solicitudes_por_estado(estado)
        return self.repository.obtener_todas_solicitudes()

    def obtener_detalle(self, solicitud_id: str) -> dict:
        """Devuelve el detalle de una solicitud."""
        return self.repository.obtener_solicitud_por_id(solicitud_id)

    def evaluar_solicitud(self, solicitud_id: str) -> dict:
        """Pasa la solicitud de 'pendiente' a 'en_evaluacion'."""
        solicitud = self.repository.obtener_solicitud_por_id(solicitud_id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada.")
        if solicitud["estado"] != "pendiente":
            raise ValueError(f"Solo se pueden evaluar solicitudes pendientes. Estado actual: {solicitud['estado']}")
        return self.repository.cambiar_estado(solicitud_id, "en_evaluacion")

    def aprobar_solicitud(self, solicitud_id: str, comentario: str = None) -> dict:
        """Aprueba una solicitud en evaluación."""
        solicitud = self.repository.obtener_solicitud_por_id(solicitud_id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada.")
        if solicitud["estado"] != "en_evaluacion":
            raise ValueError(f"Solo se pueden aprobar solicitudes en evaluación. Estado actual: {solicitud['estado']}")
        return self.repository.cambiar_estado(solicitud_id, "aprobado", comentario)

    def rechazar_solicitud(self, solicitud_id: str, comentario: str = None) -> dict:
        """Rechaza una solicitud en evaluación."""
        solicitud = self.repository.obtener_solicitud_por_id(solicitud_id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada.")
        if solicitud["estado"] != "en_evaluacion":
            raise ValueError(f"Solo se pueden rechazar solicitudes en evaluación. Estado actual: {solicitud['estado']}")
        return self.repository.cambiar_estado(solicitud_id, "rechazado", comentario)

    def desembolsar_solicitud(self, solicitud_id: str) -> dict:
        """Desembolsa una solicitud aprobada."""
        solicitud = self.repository.obtener_solicitud_por_id(solicitud_id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada.")
        if solicitud["estado"] != "aprobado":
            raise ValueError(f"Solo se pueden desembolsar solicitudes aprobadas. Estado actual: {solicitud['estado']}")
        return self.repository.cambiar_estado(solicitud_id, "desembolsado")

    def obtener_reporte(self) -> dict:
        """Reporte interno de cartera."""
        return self.repository.obtener_reporte_cartera()

    def obtener_desembolsos_hoy(self) -> list:
        """Desembolsos realizados hoy."""
        return self.repository.obtener_desembolsos_hoy()