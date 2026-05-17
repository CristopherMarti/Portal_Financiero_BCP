from fastapi import APIRouter
from controllers.dashboard_controller import DashboardController

router     = APIRouter()
controller = DashboardController()

@router.get("/cuentas/{user_id}", summary="Obtener cuentas del usuario")
async def obtener_cuentas(user_id: str):
    return await controller.obtener_cuentas(user_id)

@router.get("/resumen/{user_id}", summary="Resumen general del dashboard")
async def obtener_resumen(user_id: str):
    return await controller.obtener_resumen(user_id)

@router.get("/transacciones-recientes/{user_id}", summary="Últimas 5 transacciones")
async def ultimas_transacciones(user_id: str):
    return await controller.obtener_ultimas_transacciones(user_id)