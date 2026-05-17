from fastapi import APIRouter
from controllers.transacciones_controller import TransaccionesController

router     = APIRouter()
controller = TransaccionesController()

@router.get("/{user_id}", summary="Listar transacciones con filtros opcionales")
async def obtener_transacciones(
    user_id: str,
    tipo: str = None,
    desde: str = None,
    hasta: str = None
):
    return await controller.obtener_transacciones(user_id, tipo, desde, hasta)