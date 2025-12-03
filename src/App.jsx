import React, { useState, useEffect } from 'react';
import { Route, createBrowserRouter, RouterProvider, createRoutesFromElements } from 'react-router-dom'
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/products" element={<HomePage />} />
      <Route path="/products/:id" element={<DetailsPage />} />
      <Route path="/categories/:id" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);
export default function App() {
  return (
    <RouterProvider router={router} />
  );
}