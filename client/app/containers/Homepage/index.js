/**
 *
 * Homepage
 *
 */

import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import { connect } from 'react-redux';

import actions from '../../actions';
import banners from './banners.json';
import CarouselSlider from '../../components/Common/CarouselSlider';
import { responsiveOneItemCarousel } from '../../components/Common/CarouselSlider/utils';
import { searchByImage } from './imageSearch';

const Homepage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleFileUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setResults([]);

    try {
      const matches = await searchByImage(file);
      setResults(matches);
    } catch (error) {
      console.error('Error during image search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='homepage'>
      {/* Image Search Section */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '10px 20px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          Image Search
        </button>
        <input
          type='file'
          id='fileInput'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        {loading && <p>Loading... Please wait.</p>}
        {/* Results Section */}
        <div style={{ marginTop: '20px' }}>
          {results.length > 0 ? (
            <div>
              <h3>Matching Products:</h3>
              <ul
                style={{
                  listStyleType: 'none',
                  padding: 0,
                  width: '100%',
                  maxWidth: '600px', // Optional: limit width for a neat layout
                  margin: '0 auto', // Center the whole container
                  textAlign: 'left' // Ensure left-aligned content
                }}
              >
                {results.map(product => (
                  <li key={product.slug} style={{ margin: '10px 0' }}>
                    <a
                      href={`/product/${product.slug}`}
                      style={{ textDecoration: 'none', color: '#007bff' }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          width: '100px',
                          marginRight: '10px',
                          verticalAlign: 'middle',
                          horizontalAlign: 'middle',
                          borderRadius: '5px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {product.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !loading && <p>No matching products found.</p>
          )}
        </div>
      </div>

      {/* Banners Section */}
      <Row className='flex-row'>
        <Col xs='12' lg='6' className='order-lg-2 mb-3 px-3 px-md-2'>
          <div className='home-carousel'>
            <CarouselSlider
              swipeable={true}
              showDots={true}
              infinite={true}
              autoPlay={false}
              slides={banners}
              responsive={responsiveOneItemCarousel}
            >
              {banners.map((item, index) => (
                <img
                  key={index}
                  src={item.imageUrl}
                  alt={`Banner ${index + 1}`}
                />
              ))}
            </CarouselSlider>
          </div>
        </Col>
        <Col xs='12' lg='3' className='order-lg-1 mb-3 px-3 px-md-2'>
          <div className='d-flex flex-column h-100 justify-content-between'>
            <img
              src='/images/banners/banner-2.jpg'
              alt='Banner 2'
              className='mb-3'
            />
            <img src='/images/banners/banner-5.jpg' alt='Banner 5' />
          </div>
        </Col>
        <Col xs='12' lg='3' className='order-lg-3 mb-3 px-3 px-md-2'>
          <div className='d-flex flex-column h-100 justify-content-between'>
            <img
              src='/images/banners/banner-2.jpg'
              alt='Banner 2'
              className='mb-3'
            />
            <img src='/images/banners/banner-6.jpg' alt='Banner 6' />
          </div>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, actions)(Homepage);
