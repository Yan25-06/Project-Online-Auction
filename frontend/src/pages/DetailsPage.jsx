import React from 'react'
import Header from '../components/common/Header';
import ProductDetails from '../components/product/ProductDetails';
import { MOCK_PRODUCTS } from '../data/mockData';
const DetailsPage = () => {
  return (
    <>
      <Header/>
      <ProductDetails />
    </>
  );
};

export default DetailsPage