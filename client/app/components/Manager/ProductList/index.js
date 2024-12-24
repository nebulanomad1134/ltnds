/**
 *
 * ProductList
 *
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProductList = ({ products }) => {
  const [interactions, setInteractions] = useState({});

  useEffect(() => {
    // Fetch interaction data from the backend
    const fetchInteractions = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/admin/products-with-interactions'
        );
        const data = await response.json();
        const interactionMap = data.reduce((acc, interaction) => {
          acc[interaction._id] = interaction.count;
          return acc;
        }, {});
        setInteractions(interactionMap);
      } catch (error) {
        console.error('Failed to fetch interactions:', error);
      }
    };

    fetchInteractions();
  }, []);

  return (
    <div className='p-list'>
      {products.map((product, index) => (
        <Link
          to={`/dashboard/product/edit/${product._id}`}
          key={index}
          className='d-flex flex-row align-items-center mx-0 mb-3 product-box'
        >
          <img
            className='item-image'
            src={`${
              product && product.imageUrl
                ? product.imageUrl
                : '/images/placeholder-image.png'
            }`}
          />
          <div className='d-flex flex-column justify-content-center px-3 text-truncate'>
            <h4 className='text-truncate'>{product.name}</h4>
            <p className='mb-2 text-truncate'>{product.description}</p>
            <p>Views: {interactions[product._id] || 0}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductList;
