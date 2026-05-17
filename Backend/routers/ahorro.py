from fastapi import APIRouter
from controllers.ahorro_controller import AhorroController

router     = APIRouter()
controller = AhorroController()

@router.get("/resumen/{user_id}", summary="Resumen de cuenta de ahorro")
async def obtener_resumen(user_id: str):
    return await controller.obtener_resumen(user_id)

@router.get("/movimientos/{user_id}/{cuenta_id}", summary="Movimientos de cuenta de ahorro")
async def obtener_movimientos(user_id: str, cuenta_id: str):
    return await controller.obtener_movimientos(user_id, cuenta_id)