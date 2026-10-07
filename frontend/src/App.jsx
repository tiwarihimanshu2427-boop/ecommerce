import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* =====================================================
   ADMIN PAGES
===================================================== */

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";

/* =====================================================
   USER PAGES
===================================================== */

import Home from "./pages/user/Home";
import Products from "./pages/user/Products";
import ProductDetails from "./pages/user/ProductDetails";
import Categories from "./pages/user/Categories";
import Offers from "./pages/user/Offers";
import Wishlist from "./pages/user/Wishlist";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import OrderSuccess from "./pages/user/OrderSuccess";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Orders from "./pages/user/Orders";
import EditProfile from "./pages/user/EditProfile";
import Addresses from "./pages/user/Addresses";
import Account from "./pages/user/Account";
import ThankYou from "./pages/user/ThankYou";


/* =====================================================
   CHECK VALID JWT
===================================================== */

function isValidJwt(token) {
  if (
    !token ||
    typeof token !== "string"
  ) {
    return false;
  }

  const parts = token.trim().split(".");

  return (
    parts.length === 3 &&
    parts.every(
      (part) =>
        part &&
        part.length > 0
    )
  );
}


/* =====================================================
   ADMIN PROTECTION
===================================================== */

function ProtectedAdmin({ children }) {

  const token =
    localStorage.getItem("adminToken");

  /* -----------------------------------------------
     NO TOKEN
  ------------------------------------------------ */

  if (!isValidJwt(token)) {

    // Remove old/fake token
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "admin"
    );

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}


/* =====================================================
   ADMIN LOGIN PAGE PROTECTION
===================================================== */

function AdminLoginPage() {

  const token =
    localStorage.getItem("adminToken");

  /*
    Agar admin already login hai,
    login page dobara mat dikhao.
    Direct dashboard open karo.
  */

  if (isValidJwt(token)) {

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  return <AdminLogin />;
}


/* =====================================================
   APP
===================================================== */

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            USER ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/offers"
          element={<Offers />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success/:id"
          element={<OrderSuccess />}
        />

        <Route
          path="/thank-you/:id"
          element={<ThankYou />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            USER ACCOUNT
        ================================================= */}

        <Route
          path="/account"
          element={<Account />}
        />

        <Route
          path="/account/edit"
          element={<EditProfile />}
        />

        <Route
          path="/account/addresses"
          element={<Addresses />}
        />


        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />


        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN PRODUCTS
        ================================================= */}

        <Route
          path="/admin/products"
          element={
            <ProtectedAdmin>
              <AdminProducts />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN CATEGORIES
        ================================================= */}

        <Route
          path="/admin/categories"
          element={
            <ProtectedAdmin>
              <AdminCategories />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN ORDERS
        ================================================= */}

        <Route
          path="/admin/orders"
          element={
            <ProtectedAdmin>
              <AdminOrders />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN CUSTOMERS
        ================================================= */}

        <Route
          path="/admin/customers"
          element={
            <ProtectedAdmin>
              <AdminCustomers />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN INVENTORY
        ================================================= */}

        <Route
          path="/admin/inventory"
          element={
            <ProtectedAdmin>
              <AdminInventory />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN COUPONS
        ================================================= */}

        <Route
          path="/admin/coupons"
          element={
            <ProtectedAdmin>
              <AdminCoupons />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN REVIEWS
        ================================================= */}

        <Route
          path="/admin/reviews"
          element={
            <ProtectedAdmin>
              <AdminReviews />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            ADMIN SETTINGS
        ================================================= */}

        <Route
          path="/admin/settings"
          element={
            <ProtectedAdmin>
              <AdminSettings />
            </ProtectedAdmin>
          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;