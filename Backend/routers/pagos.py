from fastapi import APIRouter, HTTPException
from controllers.pagos_controller import PagosController
from pydantic import BaseModel

router     = APIRouter()
controller = PagosController()

class PagoRequest(BaseModel):
    user_id:          str
    servicio:         str
    numero_contrato:  str
    monto:            float

@router.get("/historial/{user_id}", summary="Historial de pagos")
async def obtener_historial(user_id: str):
    return await controller.obtener_historial(user_id)

@router.post("/registrar", summary="Registrar nuevo pago")
async def registrar_pago(datos: PagoRequest):
    try:
        return await controller.registrar_pago(datos.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))