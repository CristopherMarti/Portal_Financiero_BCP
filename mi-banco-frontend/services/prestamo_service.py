# services/prestamo_service.py
# SERVICE: lógica de negocio pura (cálculos, reglas)
# Delega el acceso a BD al Repository — NO llama a Supabase directamente
# Equivalente a @Service en Spring Boot o PagoService en ASP.NET
from repositories.prestamo_repository import PrestamoRepository

class PrestamoService:

    def __init__(self):
        self.repository = PrestamoRepository()

    def calcular_cuota(self, monto: float, plazo: int, tasa_anual: float) -> dict:
        """
        Fórmula de amortización francesa:
        C = P * [r(1+r)^n] / [(1+r)^n - 1]
        Donde: P = monto, r = tasa mensual decimal, n = plazo en meses
        """
        r      = (tasa_anual / 100) / 12
        factor = (1 + r) ** plazo
        cuota  = monto * (r * factor) / (factor - 1)
        total  = cuota * plazo

        return {
            "monto":         round(monto, 2),
            "cuota_mensual": round(cuota, 2),
            "total_pagar":   round(total, 2),
            "total_interes": round(total - monto, 2),
            "plazo_meses":   plazo,
            "tasa_anual":    tasa_anual
        }
    





#------------------------



    # Este método es llamado por el Controller para guardar la solicitud en BD
    async def guardar_solicitud(self, datos: dict) -> dict:
        """
        Antes de persistir:
        1. Verifica duplicado en los últimos 30 segundos (misma capa SERVICE).
        2. Si existe, retorna la solicitud existente en lugar de crear otra.
        3. Si no existe, recalcula la cuota con TEM y persiste.
        """
        # CAPA 1 DE PROTECCIÓN: el Service consulta al Repository
        # si ya existe una solicitud idéntica reciente
        duplicado = self.repository.buscar_solicitud_reciente(
            user_id    = str(datos["user_id"]),
            monto      = datos["monto"],
            plazo_meses= datos["plazo_meses"],
            segundos   = 60
        )

        if duplicado:
            # Lanza excepción con código 409 — el Router la captura
            raise ValueError("Solicitud duplicada: ya existe una solicitud idéntica en los últimos 60 segundos.")

        # Si no hay duplicado, recalcula la cuota con TEM correcta
        # El Service NUNCA confía en la cuota que viene del frontend
        calculo = self.calcular_cuota(
            datos["monto"],
            datos["plazo_meses"],
            datos["tasa_anual"]
        )
        datos["cuota_mensual"] = calculo["cuota_mensual"]

        return self.repository.insertar_solicitud(datos)
    

#------------------------








    
    def obtener_solicitudes(self, user_id: str) -> list:
        """Obtiene todas las solicitudes de un usuario."""
        return self.repository.obtener_solicitudes_por_usuario(user_id)

    def obtener_solicitud(self, solicitud_id: str) -> dict:
        """Obtiene una solicitud específica."""
        return self.repository.obtener_solicitud_por_id(solicitud_id)

    def eliminar_solicitud(self, solicitud_id: str) -> bool:
        """Elimina una solicitud pendiente."""
        return self.repository.eliminar_solicitud(solicitud_id)