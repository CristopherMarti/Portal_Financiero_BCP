from repositories.pagos_repository import PagosRepository

class PagosService:

    def __init__(self):
        self.repository = PagosRepository()

    def obtener_historial(self, user_id: str) -> list:
        return self.repository.obtener_historial(user_id)

    def registrar_pago(self, datos: dict) -> dict:
        return self.repository.insertar_pago(datos)