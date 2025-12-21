import React, { useState, useEffect } from 'react';
import { Route, createBrowserRouter, RouterProvider, createRoutesFromElements } from 'react-router-dom'
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserPage from './pages/UserPage';
import ProductListingPage from './pages/ProductListPage';
import PostProductPage from './pages/PostProductPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />      
        <Route path="/products" element={<HomePage />} />
        <Route path="/post-product" element={<PostProductPage />} />
        <Route path="/products/:id" element={<DetailsPage />} />
        <Route path="/categories/:categoryId" element={<ProductListingPage />} />
        <Route path="/search" element={<ProductListingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/user" element={<UserPage />} />
    </>
  )
);
export default function App() {
  return (
    <RouterProvider router={router} />
  );
}