from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .routes import router
from .route.products import router as products_router
from .route.customers import router as customers_router
from .route.suppliers import router as suppliers_router
from .route.inventory import router as inventory_router
from .route.inventory_valuation import router as inventory_valuation_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(router)
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(suppliers_router)
app.include_router(inventory_router)
app.include_router(inventory_valuation_router)