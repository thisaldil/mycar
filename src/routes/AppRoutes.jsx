import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { FullScreenLoader } from './FullScreenLoader';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Pages are code-split; the app chrome stays visible while a page loads (see AppLayout).
const page = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));

const Login = page(() => import('../pages/Login'), 'Login');
const Register = page(() => import('../pages/Register'), 'Register');
const ForgotPassword = page(() => import('../pages/ForgotPassword'), 'ForgotPassword');
const ResetPassword = page(() => import('../pages/ResetPassword'), 'ResetPassword');
const Dashboard = page(() => import('../pages/Dashboard'), 'Dashboard');
const Vehicles = page(() => import('../pages/Vehicles'), 'Vehicles');
const AddVehicle = page(() => import('../pages/AddVehicle'), 'AddVehicle');
const VehicleProfile = page(() => import('../pages/VehicleProfile'), 'VehicleProfile');
const Maintenance = page(() => import('../pages/Maintenance'), 'Maintenance');
const Fuel = page(() => import('../pages/Fuel'), 'Fuel');
const Expenses = page(() => import('../pages/Expenses'), 'Expenses');
const Documents = page(() => import('../pages/Documents'), 'Documents');
const Insurance = page(() => import('../pages/Insurance'), 'Insurance');
const Inspections = page(() => import('../pages/Inspections'), 'Inspections');
const Tyres = page(() => import('../pages/Tyres'), 'Tyres');
const Battery = page(() => import('../pages/Battery'), 'Battery');
const Accidents = page(() => import('../pages/Accidents'), 'Accidents');
const Modifications = page(() => import('../pages/Modifications'), 'Modifications');
const Reminders = page(() => import('../pages/Reminders'), 'Reminders');
const Reports = page(() => import('../pages/Reports'), 'Reports');
const Settings = page(() => import('../pages/Settings'), 'Settings');
const Profile = page(() => import('../pages/Profile'), 'Profile');
const NotFound = page(() => import('../pages/NotFound'), 'NotFound');

export function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/new" element={<AddVehicle />} />
            <Route path="/vehicles/:id" element={<VehicleProfile />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/tyres" element={<Tyres />} />
            <Route path="/battery" element={<Battery />} />
            <Route path="/accidents" element={<Accidents />} />
            <Route path="/modifications" element={<Modifications />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>);

}