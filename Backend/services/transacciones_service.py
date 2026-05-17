from repositories.transacciones_repository import TransaccionesRepository

class TransaccionesService:

    def __init__(self):
        self.repository = TransaccionesRepository()

    def obtener_transacciones(
        self,
        user_id: str,
        tipo: str = None,
        desde: str = None,
        hasta: str = None
    ) -> dict:
        txns = self.repository.obtener_transacciones(user_id, tipo, desde, hasta)

        # Calcular resumen
        debitos  = sum(float(t["monto"]) for t in txns if t["tipo"] == "debito")
        creditos = sum(float(t["monto"]) for t in txns if t["tipo"] == "credito")

        return {
            "transacciones": txns,
            "resumen": {
                "total":    len(txns),
                "debitos":  round(debitos, 2),
                "creditos": round(creditos, 2),
                "neto":     round(creditos - debitos, 2)
            }
        }