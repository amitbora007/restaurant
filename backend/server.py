from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import razorpay
import base64
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("restaurant_api")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'restaurant_db')]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
ADMIN_REGISTRATION_KEY = os.environ.get('ADMIN_REGISTRATION_KEY', '')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Razorpay client
razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID', '')
razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await db.categories.create_index("order")
        await db.menu_items.create_index("category_id")
        await db.orders.create_index([("created_at", -1)])
        await db.users.create_index("email", unique=True)
        logger.info("MongoDB database indexes successfully verified.")
    except Exception as e:
        logger.warning(f"Note on index creation: {e}")
    yield
    client.close()
    logger.info("MongoDB connection closed.")

app = FastAPI(title="Food Hub API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# Models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    admin_key: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    category_id: str
    price_half: Optional[float] = None
    price_full: Optional[float] = None
    image_url: Optional[str] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: str
    price_half: Optional[float] = None
    price_full: Optional[float] = None
    image_url: Optional[str] = None
    is_available: bool = True

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    menu_item_id: str
    name: str
    price: float
    quantity: int
    size: str = "full"
    image_url: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    fulfillment_type: str = "delivery"  # delivery, takeaway, dine_in
    delivery_address: Optional[str] = None
    table_number: Optional[str] = None
    notes: Optional[str] = None
    items: List[CartItem] = Field(default_factory=list)
    subtotal: float = 0.0
    gst_amount: float = 0.0
    delivery_fee: float = 0.0
    total_amount: float
    status: str = "pending"  # pending, paid, preparing, out_for_delivery, completed, cancelled
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    fulfillment_type: str = "delivery"
    delivery_address: Optional[str] = None
    table_number: Optional[str] = None
    notes: Optional[str] = None
    items: List[CartItem]

class OrderStatusUpdate(BaseModel):
    status: str

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if this is initial registration or requires registration key
    users_count = await db.users.count_documents({})
    if users_count > 0 and ADMIN_REGISTRATION_KEY:
        if not user.admin_key or user.admin_key != ADMIN_REGISTRATION_KEY:
            raise HTTPException(status_code=403, detail="Valid admin registration key is required to create an admin account.")

    existing_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Category routes
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate, _: str = Depends(get_current_user)):
    cat_obj = Category(**category.model_dump())
    doc = cat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return cat_obj

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category: CategoryCreate, _: str = Depends(get_current_user)):
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": category.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, _: str = Depends(get_current_user)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# Menu Item routes
@api_router.get("/menu-items", response_model=List[MenuItem])
async def get_menu_items(category_id: Optional[str] = None):
    query = {"category_id": category_id} if category_id else {}
    items = await db.menu_items.find(query, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.post("/menu-items", response_model=MenuItem)
async def create_menu_item(item: MenuItemCreate, _: str = Depends(get_current_user)):
    item_obj = MenuItem(**item.model_dump())
    doc = item_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.menu_items.insert_one(doc)
    return item_obj

@api_router.put("/menu-items/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item: MenuItemCreate, _: str = Depends(get_current_user)):
    result = await db.menu_items.update_one(
        {"id": item_id},
        {"$set": item.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    updated = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, _: str = Depends(get_current_user)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), _: str = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds maximum limit of 5MB")
        
    base64_encoded = base64.b64encode(contents).decode('utf-8')
    image_url = f"data:{file.content_type};base64,{base64_encoded}"
    return {"url": image_url}

# Order routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    if not order.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty")
        
    # Security: Fetch items from DB to recalculate verified prices (Prevent price tampering)
    item_ids = [item.menu_item_id for item in order.items]
    db_items = await db.menu_items.find({"id": {"$in": item_ids}}, {"_id": 0}).to_list(100)
    db_items_map = {item["id"]: item for item in db_items}
    
    verified_items: List[CartItem] = []
    subtotal = 0.0
    
    for item in order.items:
        db_item = db_items_map.get(item.menu_item_id)
        if not db_item:
            raise HTTPException(status_code=400, detail=f"Item '{item.name}' is no longer available in the menu")
            
        if not db_item.get("is_available", True):
            raise HTTPException(status_code=400, detail=f"Item '{db_item.get('name')}' is currently sold out")
            
        quantity = max(1, min(int(item.quantity), 50))
        
        # Verify legitimate price by size
        if item.size == 'half':
            unit_price = db_item.get('price_half') or db_item.get('price_full')
        else:
            unit_price = db_item.get('price_full') or db_item.get('price_half')
            
        if unit_price is None or unit_price <= 0:
            raise HTTPException(status_code=400, detail=f"Price not available for {db_item.get('name')} ({item.size})")
            
        verified_item = CartItem(
            menu_item_id=db_item["id"],
            name=db_item["name"],
            price=float(unit_price),
            quantity=quantity,
            size=item.size,
            image_url=db_item.get("image_url")
        )
        verified_items.append(verified_item)
        subtotal += float(unit_price) * quantity
        
    subtotal = round(subtotal, 2)
    # GST calculation (5% standard restaurant tax in India)
    gst_amount = round(subtotal * 0.05, 2)
    
    # Delivery fee: ₹40 for delivery if under ₹500, free for ₹500+ or takeaway/dine_in
    if order.fulfillment_type == "delivery" and subtotal < 500:
        delivery_fee = 40.0
    else:
        delivery_fee = 0.0
        
    total_amount = round(subtotal + gst_amount + delivery_fee, 2)
    
    order_id = str(uuid.uuid4())
    doc = {
        "id": order_id,
        "customer_name": order.customer_name.strip(),
        "customer_email": order.customer_email.strip(),
        "customer_phone": order.customer_phone.strip(),
        "fulfillment_type": order.fulfillment_type,
        "delivery_address": order.delivery_address,
        "table_number": order.table_number,
        "notes": order.notes,
        "items": [it.model_dump() for it in verified_items],
        "subtotal": subtotal,
        "gst_amount": gst_amount,
        "delivery_fee": delivery_fee,
        "total_amount": total_amount,
        "status": "pending",
        "razorpay_order_id": None,
        "razorpay_payment_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    if razorpay_key_id and razorpay_key_id != 'rzp_test_dummy' and not razorpay_key_id.startswith('dummy'):
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": int(round(total_amount * 100)),
                "currency": "INR",
                "payment_capture": 1
            })
            doc['razorpay_order_id'] = razorpay_order['id']
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {str(e)}")
            raise HTTPException(status_code=502, detail=f"Payment gateway error: {str(e)}")
    else:
        logger.info("Demo mode: Order placed without Razorpay payment gateway")
        doc['razorpay_order_id'] = None
        doc['status'] = 'paid'
        
    await db.orders.insert_one(doc)
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return Order(**doc)

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order_by_id(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        try:
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        except Exception:
            order['created_at'] = datetime.now(timezone.utc)
    if not order.get('subtotal') and order.get('total_amount'):
        order['subtotal'] = order['total_amount']
    return Order(**order)

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: OrderStatusUpdate, _: str = Depends(get_current_user)):
    valid_statuses = {"pending", "paid", "preparing", "out_for_delivery", "completed", "cancelled"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": payload.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated successfully", "status": payload.status}

@api_router.post("/verify-payment")
async def verify_payment(verification: PaymentVerification):
    try:
        # Verify order exists and matches razorpay_order_id
        db_order = await db.orders.find_one({"id": verification.order_id}, {"_id": 0})
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        if db_order.get("razorpay_order_id") != verification.razorpay_order_id:
            raise HTTPException(status_code=400, detail="Razorpay order ID mismatch")
            
        params_dict = {
            'razorpay_order_id': verification.razorpay_order_id,
            'razorpay_payment_id': verification.razorpay_payment_id,
            'razorpay_signature': verification.razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        await db.orders.update_one(
            {"id": verification.order_id},
            {"$set": {
                "status": "paid",
                "razorpay_payment_id": verification.razorpay_payment_id
            }}
        )
        return {"status": "success", "message": "Payment verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Signature verification failed")

@api_router.get("/orders", response_model=List[Order])
async def get_orders(_: str = Depends(get_current_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            try:
                order['created_at'] = datetime.fromisoformat(order['created_at'])
            except Exception:
                order['created_at'] = datetime.now(timezone.utc)
        if not order.get('subtotal') and order.get('total_amount'):
            order['subtotal'] = order['total_amount']
    return orders

@api_router.get("/")
async def root():
    return {
        "restaurant": "Food Hub",
        "status": "online",
        "version": "2.0.0"
    }

app.include_router(api_router)

# Allowed CORS origins
allowed_origins_env = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
origins = [o.strip() for o in allowed_origins_env.split(',') if o.strip()]
if not origins or '*' in origins:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)