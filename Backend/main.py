from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import prestamos, dashboard, transacciones, pagos, ahorro
from routers import creditos
from fastapi import Header, HTTPException
import os
from supabase import create_client
from routers import auth



app = FastAPI(
    title="Portal Mi Banco",
    version="2.0.0",
    description="API completa del portal bancario"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(prestamos.router,     prefix="/api/prestamos",     tags=["Préstamos"])
app.include_router(dashboard.router,     prefix="/api/dashboard",     tags=["Dashboard"])
app.include_router(transacciones.router, prefix="/api/transacciones", tags=["Transacciones"])
app.include_router(pagos.router,         prefix="/api/pagos",         tags=["Pagos"])
app.include_router(ahorro.router,        prefix="/api/ahorro",        tags=["Ahorro"])
app.include_router(creditos.router, prefix="/api/creditos", tags=["Créditos"])
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])


supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

async def verificar_token(authorization: str = Header(...)):
    """Verifica que el token de Supabase sea válido."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    token = authorization.replace("Bearer ", "")
    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="No autorizado")
    return user