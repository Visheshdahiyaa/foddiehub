import React, { useState } from 'react'
import { MdClose, MdLocationOn, MdPhone, MdStar } from 'react-icons/md'

function RestaurantMap({ restaurant, onClose }) {
  const restaurants = [
    { id: 1, name: 'Pizza Palace', image: '🍕', rating: 4.5, reviews: 234, distance: 2.3, deliveryTime: '30-40 mins', deliveryFee: '₹20' },
    { id: 2, name: 'Burger Barn', image: '🍔', rating: 4.3, reviews: 189, distance: 1.8, deliveryTime: '25-35 mins', deliveryFee: '₹15' },
    { id: 3, name: 'Biryani House', image: '🍚', rating: 4.7, reviews: 456, distance: 3.1, deliveryTime: '40-50 mins', deliveryFee: '₹25' }
  ]

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden'>
        <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-white'>Nearby Restaurants</h2>
            <p className='text-green-100'>Find restaurants near you</p>
          </div>
          <button onClick={onClose} className='p-1 hover:bg-green-700 rounded'>
            <MdClose className='w-6 h-6 text-white' />
          </button>
        </div>

        <div className='p-6'>
          <h3 className='font-semibold text-gray-800 dark:text-white mb-4 text-lg'>Available Restaurants</h3>
          <div className='space-y-3'>
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className='p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-400 transition-all cursor-pointer'
              >
                <div className='flex justify-between items-start mb-2'>
                  <div className='flex items-center gap-3'>
                    <span className='text-4xl'>{rest.image}</span>
                    <div>
                      <h5 className='font-semibold text-gray-800 dark:text-white'>{rest.name}</h5>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-yellow-500 flex items-center gap-1'>
                      <MdStar className='w-4 h-4' /> {rest.rating}
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-400'>{rest.reviews} reviews</p>
                  </div>
                </div>
                <div className='grid grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3'>
                  <div>📍 {rest.distance} km</div>
                  <div>⏱️ {rest.deliveryTime}</div>
                  <div>🚗 {rest.deliveryFee}</div>
                </div>
                <button className='w-full px-3 py-2 bg-green-500 text-white rounded font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2'>
                  <MdPhone className='w-4 h-4' /> Call & Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantMap
            <h2 className='text-2xl font-bold text-white'>Restaurant Location</h2>
            <p className='text-green-100'>{selectedRestaurant.name}</p>
          </div>
          <MdClose className='w-6 h-6 text-white cursor-pointer hover:opacity-80' onClick={onClose} />
        </div>

        <div className='p-6 space-y-6'>
          {/* Map View */}
          <div className='bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg overflow-hidden h-80 relative border-2 border-gray-300 dark:border-gray-600'>
            {/* Simple Map Grid Background */}
            <div className='w-full h-full flex items-center justify-center relative overflow-hidden'>
              <svg className='absolute inset-0 w-full h-full opacity-10' viewBox='0 0 100 100'>
                <defs>
                  <pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'>
                    <path d='M 10 0 L 0 0 0 10' fill='none' stroke='currentColor' strokeWidth='0.5' />
                  </pattern>
                </defs>
                <rect width='100' height='100' fill='url(#grid)' />
              </svg>

              {/* Restaurant Markers */}
              {restaurants.map((rest, idx) => (
                <div
                  key={rest.id}
                  className={`absolute flex flex-col items-center group cursor-pointer z-10 transition-all hover:scale-110`}
                  style={{
                    left: `${20 + idx * 25}%`,
                    top: `${40 - idx * 15}%`
                  }}
                  onClick={() => {}}
                >
                  <div className={`${
                    selectedRestaurant.id === rest.id
                      ? 'bg-red-600 scale-125 ring-4 ring-red-400'
                      : 'bg-orange-500'
                  } w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-2xl relative`}>
                    {rest.image}
                  </div>
                  <div className='mt-1 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                    {rest.name}
                  </div>
                </div>
              ))}

              {/* Your Location */}
              <div className='absolute bottom-8 right-8 flex flex-col items-center group cursor-pointer z-10'>
                <div className='bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg text-lg animate-pulse'>
                  📍
                </div>
                <div className='mt-1 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                  Your Location
                </div>
              </div>

              {/* Distance Lines */}
              <svg className='absolute inset-0 w-full h-full pointer-events-none' style={{ opacity: 0.2 }}>
                {restaurants.map((rest, idx) => (
                  <line
                    key={idx}
                    x1='90%'
                    y1='85%'
                    x2={`${20 + idx * 25}%`}
                    y2={`${40 - idx * 15}%`}
                    stroke='#3b82f6'
                    strokeWidth='1'
                    strokeDasharray='5,5'
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Restaurant Details Tabs */}
          <div className='flex gap-2 border-b border-gray-300 dark:border-gray-600'>
            <button
              onClick={() => setSelectedInfo('details')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                selectedInfo === 'details'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setSelectedInfo('nearby')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                selectedInfo === 'nearby'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Nearby Restaurants
            </button>
          </div>

          {/* Details View */}
          {selectedInfo === 'details' && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                    <FaMapMarkerAlt className='text-red-500' /> Location
                  </h4>
                  <p className='text-sm text-gray-600 dark:text-gray-300 mb-2'>{selectedRestaurant.address}</p>
                  <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                    📍 {selectedRestaurant.lat.toFixed(4)}, {selectedRestaurant.lng.toFixed(4)}
                  </p>
                </div>

                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                    <MdStar className='text-yellow-500' /> Rating & Reviews
                  </h4>
                  <div className='flex items-center gap-3'>
                    <div>
                      <p className='text-2xl font-bold text-yellow-500'>{selectedRestaurant.rating}</p>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>{selectedRestaurant.reviews} reviews</p>
                    </div>
                    <div className='text-2xl'>
                      {'⭐'.repeat(Math.floor(selectedRestaurant.rating))}
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                    <MdDeliveryDining className='text-green-500' /> Delivery Info
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <p><span className='text-gray-600 dark:text-gray-400'>Time:</span> <span className='font-semibold text-gray-800 dark:text-white'>{selectedRestaurant.deliveryTime}</span></p>
                    <p><span className='text-gray-600 dark:text-gray-400'>Fee:</span> <span className='font-semibold text-gray-800 dark:text-white'>{selectedRestaurant.deliveryFee}</span></p>
                    <p><span className='text-gray-600 dark:text-gray-400'>Distance:</span> <span className='font-semibold text-gray-800 dark:text-white'>{selectedRestaurant.distance} km</span></p>
                  </div>
                </div>

                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                    <FaClock className='text-blue-500' /> More Info
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <p><span className='text-gray-600 dark:text-gray-400'>Cuisine:</span> <span className='font-semibold text-gray-800 dark:text-white'>{selectedRestaurant.cuisine}</span></p>
                    <p className='flex items-center gap-2'>
                      <span className='text-gray-600 dark:text-gray-400'>Status:</span>
                      <span className='bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                        {selectedRestaurant.open ? '🟢 Open' : '🔴 Closed'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button className='w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2'>
                <MdPhone className='w-5 h-5' /> Call Restaurant
              </button>
            </div>
          )}

          {/* Nearby Restaurants */}
          {selectedInfo === 'nearby' && (
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRestaurant.id === rest.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-400'
                  }`}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div className='flex items-center gap-3'>
                      <span className='text-3xl'>{rest.image}</span>
                      <div>
                        <h5 className='font-semibold text-gray-800 dark:text-white'>{rest.name}</h5>
                        <p className='text-xs text-gray-600 dark:text-gray-400'>{rest.cuisine}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-gray-800 dark:text-white flex items-center gap-1'>
                        ⭐ {rest.rating}
                      </p>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>{rest.reviews} reviews</p>
                    </div>
                  </div>
                  <div className='flex justify-between text-sm text-gray-600 dark:text-gray-400'>
                    <span>📍 {rest.distance} km</span>
                    <span>⏱️ {rest.deliveryTime}</span>
                    <span>🚗 {rest.deliveryFee}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantMap
