# routers/creditos.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from controllers.creditos_controller import CreditosController

router     = APIRouter()
controller = CreditosController()

class AccionRequest(BaseModel):
    comentario: Optional[str] = None

# ── Bandeja de solicitudes ─────────────────────────────
# GET /api/creditos/bandeja                → todas
# GET /api/creditos/bandeja?estado=pendiente → filtradas
@router.get("/bandeja", summary="Bandeja de solicitudes (Core Bancario)")
async def obtener_bandeja(estado: Optional[str] = Query(None)):
    return await controller.obtener_bandeja(estado)

# ── Detalle de una solicitud ───────────────────────────
# GET /api/creditos/solicitud/{solicitud_id}
@router.get("/solicitud/{solicitud_id}", summary="Detalle de solicitud")
async def obtener_detalle(solicitud_id: str):
    return await controller.obtener_detalle(solicitud_id)

# ── Flujo de aprobación ────────────────────────────────
# PATCH /api/creditos/evaluar/{solicitud_id}    pendiente → en_evaluacion
# PATCH /api/creditos/aprobar/{solicitud_id}    en_evaluacion → aprobado
# PATCH /api/creditos/rechazar/{solicitud_id}   en_evaluacion → rechazado
# PATCH /api/creditos/desembolsar/{solicitud_id} aprobado → desembolsado

@router.patch("/evaluar/{solicitud_id}", summary="Pasar a evaluación")
async def evaluar(solicitud_id: str):
    try:
        return await controller.evaluar(solicitud_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/aprobar/{solicitud_id}", summary="Aprobar solicitud")
async def aprobar(solicitud_id: str, body: AccionRequest = AccionRequest()):
    try:
        return await controller.aprobar(solicitud_id, body.comentario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/rechazar/{solicitud_id}", summary="Rechazar solicitud")
async def rechazar(solicitud_id: str, body: AccionRequest = AccionRequest()):
    try:
        return await controller.rechazar(solicitud_id, body.comentario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/desembolsar/{solicitud_id}", summary="Desembolsar crédito aprobado")
async def desembolsar(solicitud_id: str):
    try:
        return await controller.desembolsar(solicitud_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ── Reportes internos ──────────────────────────────────
# GET /api/creditos/reporte/cartera
# GET /api/creditos/reporte/desembolsos-hoy

@router.get("/reporte/cartera", summary="Reporte de cartera activa")
async def reporte_cartera():
    return await controller.reporte()

@router.get("/reporte/desembolsos-hoy", summary="Desembolsos del día")
async def desembolsos_hoy():
    return await controller.desembolsos_hoy()