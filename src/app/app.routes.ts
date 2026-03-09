import { Routes } from '@angular/router';
import { Home } from './home/components/home/home';
import { Products } from './shop/components/products/products';
import { ProductDetail } from './shop/components/product-detail/product-detail';
import { Cart } from './shop/components/cart/cart';
import { Login } from './auth/components/login/login';
import { AdminDashboard } from './admin/components/admin-dashboard/admin-dashboard';
import { NotFound } from './shared/components/not-found/not-found';
import { adminGuard, noAdminGuard } from './auth/guards/auth.guard';

// All application routes defined in one place.
// Angular matches URLs top-to-bottom — the first matching route wins.
// The wildcard '**' MUST be last so it only catches truly unknown URLs.
export const routes: Routes = [
    { path: '',                 component: Home           },  // / → Home page
    { path: 'products',         component: Products       },  // /products → All products list
    { path: 'products/:id',     component: ProductDetail  },  // /products/3 → Single product detail (:id is a route param)
    { path: 'cart',             component: Cart,           canActivate: [noAdminGuard] },  // /cart → customers only (admin redirected to dashboard)
    { path: 'login',            component: Login          },  // /login → Admin login page
    { path: 'admin/dashboard',  component: AdminDashboard, canActivate: [adminGuard] },  // /admin-dashboard → admin only (guard blocks non-admins)
    { path: '**',               component: NotFound       },  // 404 - catch all unknown routes
];
