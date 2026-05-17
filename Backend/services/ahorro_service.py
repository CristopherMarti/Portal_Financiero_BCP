from repositories.ahorro_repository import AhorroRepository

class AhorroService:

    def __init__(self):
        self.repository = AhorroRepository()

    def obtener_resumen(self, user_id: str) -> dict:
        ahorro  = self.repository.obtener_cuenta_ahorro(user_id)
        detalle = self.repository.obtener_cuenta_ahorro_detalle(user_id)

        if not ahorro:
            return {"ahorro": None, "cuenta_detalle": None}

        saldo = float(ahorro.get("saldo", 0))
        meta  = float(ahorro.get("meta_ahorro", 1))
        pct   = min(round((saldo / meta) * 100), 100)

        # Proyección 12 meses
        tasa_mensual = float(ahorro.get("tasa_interes", 0)) / 100 / 12
        saldo_proy   = saldo
        proyeccion   = []

        for mes in range(1, 13):
            interes     = saldo_proy * tasa_mensual
            saldo_proy += interes
            proyeccion.append({
                "mes":     mes,
                "saldo":   round(saldo_proy, 2),
                "interes": round(interes, 2)
            })

        return {
            "ahorro":         ahorro,
            "cuenta_detalle": detalle,
            "progreso_pct":   pct,
            "falta":          round(max(meta - saldo, 0), 2),
            "proyeccion":     proyeccion
        }

    def obtener_movimientos(self, user_id: str, cuenta_id: str) -> list:
        return self.repository.obtener_movimientos(user_id, cuenta_id)