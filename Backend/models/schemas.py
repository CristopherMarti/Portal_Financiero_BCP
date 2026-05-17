from pydantic import BaseModel, Field, validator
from uuid import UUID
from typing import Optional

# --- ESQUEMAS DE ENTRADA (lo que envía el usuario) ---

class PrestamoSimularRequest(BaseModel):
    """Datos necesarios para simular un prestamo (sin guardar en BD)."""
    monto: float = Field(gt=0, le=100000, description="Monto del prestamo en soles")
    plazo_meses: int = Field(ge=6, le=60, description="Plazo en meses")
    tasa_anual: float = Field(gt=0, le=50, description="Tasa de interes anual %")

class PrestamoSolicitudRequest(BaseModel):
    user_id: UUID
    monto: float
    plazo_meses: int
    tasa_anual: float
    proposito: str
    ingresos_mensuales: float

    @validator("proposito")
    def validar_proposito(cls, v):
        opciones = ["consumo", "educacion", "salud", "vivienda", "negocio", "viaje", "otro"]
        if v not in opciones:
            raise ValueError(f"Proposito debe ser uno de: {opciones}")
        return v
#------------------------------------------------



# --- ESQUEMA DE SALIDA (lo que devuelve la API) ---

class PrestamoSimularResponse(BaseModel):
    """Resultado de la simulacion que se envia al usuario."""
    monto: float
    cuota_mensual: float
    total_pagar: float
    total_interes: float
    plazo_meses: int
    tasa_anual: float

#------------------------

# ── DASHBOARD ─────────────────────────────────────────────
class CuentaResponse(BaseModel):
    id: str
    user_id: str
    tipo: str
    numero_cuenta: str
    saldo: float
    moneda: str

class TransaccionResponse(BaseModel):
    id: str
    user_id: str
    cuenta_id: Optional[str]
    tipo: str
    descripcion: str
    monto: float
    fecha: Optional[str]

# ── TRANSACCIONES ─────────────────────────────────────────
class TransaccionFiltroRequest(BaseModel):
    user_id: str
    tipo: Optional[str] = None
    desde: Optional[str] = None
    hasta: Optional[str] = None


## ── LOGIN/REGISTROS ────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:    str
    password: str

class RegistroRequest(BaseModel):
    nombre:   str
    email:    str
    password: str