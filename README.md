# The Flavour Junction - Restaurant Web Application

A full-stack restaurant web application with elegant dark theme, featuring menu browsing, shopping cart, checkout with Razorpay integration, and a complete admin panel for managing categories and menu items.

## 🌟 Features

### Customer Features
- **Elegant Landing Page** - Beautiful hero section with restaurant showcase
- **Menu Browsing** - 16 categories with 50+ menu items
- **Smart Cart System** - Add/remove items, quantity controls, item count badges
- **Checkout Flow** - Order placement with Razorpay payment integration
- **Fully Responsive** - Perfect experience on mobile, tablet, and desktop

### Admin Features
- **Secure Authentication** - JWT-based login/registration
- **Dashboard** - Statistics overview (categories, items, orders)
- **Category Management** - Full CRUD operations
- **Menu Item Management** - Add/edit/delete items with image upload
- **Order Management** - View all customer orders

## 🛠️ Tech Stack

**Frontend:**
- React 19
- React Router DOM
- Tailwind CSS
- Shadcn/UI Primitives (trimmed to actively used components)
- Framer Motion (animations)
- Axios
- Sonner (toasts)

**Backend:**
- FastAPI (Python)
- MongoDB (Motor - async driver)
- JWT Authentication
- Razorpay Integration
- Python 3.11+

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Yarn** package manager - Install with: `npm install -g yarn`

## 🚀 Local Setup Instructions

### 1. Extract the Project
```bash
# Extract the zip file
unzip the-flavour-junction.zip
cd the-flavour-junction
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt


# Start MongoDB (if not running)
# Make sure MongoDB is running on localhost:27017
# You can start it with: mongod

# Run the backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: `http://localhost:8001`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Start the development server
yarn start
```

Alternative with npm:

```bash
npm install
npm start
```

Frontend will be available at: `http://localhost:3000`

### 4. Seed Database (Optional but Recommended)

To populate the database with initial menu data:

```bash
# In backend directory (with virtual environment activated)
cd backend
python seed_data.py
```

This will add:
- 16 categories (MOMOS, SOUTH INDIAN, TANDOORI SNACKS, etc.)
- 50+ menu items with prices and images

## ⚙️ Configuration

### Backend Configuration (.env)

Located at: `backend/.env`

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="restaurant_db"
CORS_ORIGINS="*"
JWT_SECRET_KEY="your-secret-key-change-in-production"
RAZORPAY_KEY_ID="your_razorpay_test_key"
RAZORPAY_KEY_SECRET="your_razorpay_test_secret"
```

**Note:**
- Update `JWT_SECRET_KEY` for production
- Add your Razorpay test keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
- The app works in demo mode without Razorpay keys

### Frontend Configuration (.env)

Located at: `frontend/.env`

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Note:
- Frontend build/dev config loads environment variables via `dotenv` from `craco.config.js`.

## 🎨 Design Theme

- **Color Scheme:** Dark mode with gold accents
- **Typography:**
  - Headings: Playfair Display (serif)
  - Body: DM Sans (sans-serif)
- **Design Style:** Elegant, sophisticated, upscale restaurant aesthetic

## 📱 Admin Panel Access

1. Navigate to: `http://localhost:3000/admin/login`
2. Register a new admin account
3. Access the admin dashboard with full CRUD capabilities

**Admin Routes:**
- `/admin` - Dashboard
- `/admin/categories` - Manage categories
- `/admin/menu-items` - Manage menu items
- `/admin/orders` - View orders

## 🔧 API Endpoints

**Public Endpoints:**
- `GET /api/categories` - Get all categories
- `GET /api/menu-items` - Get all menu items
- `POST /api/orders` - Create order

**Protected Admin Endpoints (Require JWT Token):**
- `POST /api/auth/register` - Admin registration
- `POST /api/auth/login` - Admin login
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/{id}` - Update menu item
- `DELETE /api/menu-items/{id}` - Delete menu item
- `POST /api/upload-image` - Upload image
- `GET /api/orders` - Get all orders

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```bash
# Ensure MongoDB is running
mongod

# Or check MongoDB service status:
# Windows: services.msc (look for MongoDB)
# Linux: sudo systemctl status mongod
# macOS: brew services list
```

**Port Already in Use:**
```bash
# Change port in uvicorn command
uvicorn server:app --reload --port 8002
# Update REACT_APP_BACKEND_URL in frontend/.env accordingly
```

### Frontend Issues

**Dependencies Installation Error:**
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock package-lock.json
yarn install
# or
npm install
```

**API Connection Error:**
- Verify backend is running on port 8001
- Check `REACT_APP_BACKEND_URL` in `frontend/.env`
- Ensure no CORS errors in browser console

## 📦 Project Structure

```
the-flavour-junction/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── seed_data.py           # Database seeding script
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend configuration
│
├── frontend/
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Active UI primitives (button, dialog, input, label, select, sonner, tabs)
│   │   │   ├── Layout.js     # Main layout with navbar
│   │   │   └── AdminLayout.js # Admin layout
│   │   ├── pages/
│   │   │   ├── Home.js       # Landing page
│   │   │   ├── Menu.js       # Menu browsing
│   │   │   ├── Cart.js       # Shopping cart
│   │   │   ├── Checkout.js   # Checkout page
│   │   │   └── admin/        # Admin pages
│   │   ├── App.js            # Root component
│   │   ├── App.css           # Component styles
│   │   └── index.css         # Global styles
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── .env                  # Frontend configuration
│
└── README_LOCAL_SETUP.md      # This file
```

## 🧹 Recent Cleanup (March 2026)

- Removed unused frontend UI component files under `src/components/ui` and `src/hooks/use-toast.js`.
- Reduced frontend dependencies in `frontend/package.json` to only required runtime/build packages.
- Added missing `dotenv` dependency because CRACO config imports it.
- Current active UI primitives:
  - `button.jsx`
  - `dialog.jsx`
  - `input.jsx`
  - `label.jsx`
  - `select.jsx`
  - `sonner.jsx`
  - `tabs.jsx`

## 🎯 Key Features Implemented

✅ Menu extraction from images (50+ items, 16 categories)
✅ Shopping cart with quantity controls
✅ Item count badges on menu cards
✅ Remove items directly from menu
✅ Fully responsive mobile design
✅ JWT authentication for admin
✅ Image upload for menu items
✅ Razorpay payment integration
✅ Order management system
✅ Dark theme with gold accents
✅ Smooth animations with Framer Motion
✅ Toast notifications

## 🚢 Production Deployment

### Environment Variables to Update

**Backend:**
- Set strong `JWT_SECRET_KEY`
- Add production MongoDB URL
- Add production Razorpay keys
- Configure CORS for your domain

**Frontend:**
- Update `REACT_APP_BACKEND_URL` to production API URL
- Build the app: `yarn build`
- Deploy the `build` folder to hosting service

### Recommended Hosting

- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** AWS EC2, DigitalOcean, Heroku, or Railway
- **Database:** MongoDB Atlas (free tier available)

## 📄 License

This project is created for educational/portfolio purposes.

## 👨‍💻 Author

Built with ❤️ using Emergent AI

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check console logs for errors

---

**Happy Coding! 🚀**
