from repositories.dashboard_repository import DashboardRepository

class DashboardService:

    def __init__(self):
        self.repository = DashboardRepository()

    def obtener_cuentas(self, user_id: str) -> list:
        return self.repository.obtener_cuentas(user_id)

    def obtener_ultimas_transacciones(self, user_id: str) -> list:
        return self.repository.obtener_ultimas_transacciones(user_id)

    def obtener_resumen(self, user_id: str) -> dict:
        """Calcula el saldo total y resumen de cuentas."""
        cuentas = self.repository.obtener_cuentas(user_id)
        saldo_total = sum(float(c["saldo"]) for c in cuentas)
        return {
            "total_cuentas": len(cuentas),
            "saldo_total":   round(saldo_total, 2),
            "cuentas":       cuentas
        }