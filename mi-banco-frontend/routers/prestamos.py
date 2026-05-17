# routers/prestamos.py
# ROUTER: solo define las URLs y delega al Controller
# NOTA: En FastAPI es convención fusionar Router + Controller en un solo archivo.
# Aquí los separamos explícitamente para seguir el patrón:
#   ROUTER → CONTROLLER → SERVICE → REPOSITORY → BASE DE DATOS
# Equivalente a authRoutes.js en Express o routes/api.php en Laravel
from fastapi import APIRouter

from fastapi import APIRouter, HTTPException

from models.schemas import PrestamoSimularRequest, PrestamoSolicitudRequest
from controllers.prestamo_controller import PrestamoController

router     = APIRouter()
controller = PrestamoController()

# POST /api/prestamos/simular → solo calcula, NO guarda en BD
@router.post("/simular", summary="Simular cuota de préstamo")
async def simular_prestamo(datos: PrestamoSimularRequest):
    return await controller.simular(datos)





#-----------------------

# POST /api/prestamos/solicitar → calcula Y guarda en Supabase
@router.post("/solicitar")
async def solicitar_prestamo(datos: PrestamoSolicitudRequest):
    try:
        resultado = await controller.solicitar(datos)
        return {"success": True, "data": resultado}
    except ValueError as e:
        # 409 Conflict — solicitud duplicada detectada por el Service
        raise HTTPException(status_code=409, detail=str(e))


#------------------------




# GET /api/prestamos/solicitudes/{user_id} → ver todas las solicitudes
@router.get("/solicitudes/{user_id}", summary="Listar solicitudes por usuario")
async def listar_solicitudes(user_id: str):
    return await controller.listar_solicitudes(user_id)

# GET /api/prestamos/solicitudes/{user_id}/{solicitud_id} → ver detalle
@router.get("/solicitudes/{user_id}/{solicitud_id}", summary="Ver detalle de solicitud")
async def ver_solicitud(solicitud_id: str):
    return await controller.ver_solicitud(solicitud_id)

# DELETE /api/prestamos/solicitudes/{solicitud_id} → cancelar solicitud
@router.delete("/solicitudes/{solicitud_id}", summary="Cancelar solicitud pendiente")
async def cancelar_solicitud(solicitud_id: str):
    return await controller.cancelar_solicitud(solicitud_id)