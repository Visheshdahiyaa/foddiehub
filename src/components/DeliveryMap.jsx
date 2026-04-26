import React, { useState, useEffect } from 'react'
import { MdClose, MdLocationOn, MdNavigation } from 'react-icons/md'
import { FaClock, FaPhone } from 'react-icons/fa'

function DeliveryMap({ orderId, onClose }) {
  const [deliveryData, setDeliveryData] = useState({
    status: 'in_transit',
    deliveryPartner: {
      name: 'Raj Kumar',
      phone: '+91 9876543210',
      rating: 4.8,
      vehicle: 'Bike - DL 01 AB 1234'
    },
    restaurant: {
      name: 'Pizza Palace',
      lat: 28.6139,
      lng: 77.2090
    },
    delivery: {
      lat: 28.5355,
      lng: 77.3910
    },
    estimatedTime: 18,
    distance: 2.3,
    progress: 65
  })

  // Simulate delivery partner movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryData(prev => ({
        ...prev,
        delivery: {
          lat: prev.delivery.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.delivery.lng + (Math.random() - 0.5) * 0.001
        },
        progress: Math.min(prev.progress + Math.random() * 5, 100),
        estimatedTime: Math.max(prev.estimatedTime - 1, 0)
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const updateStatus = (newStatus) => {
    setDeliveryData(prev => ({
      ...prev,
      status: newStatus,
      progress: newStatus === 'delivered' ? 100 : prev.progress
    }))
  }

  const getStatusColor = () => {
    switch (deliveryData.status) {
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-yellow-500'
      case 'in_transit': return 'bg-orange-500'
      case 'delivered': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (deliveryData.status) {
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Preparing Your Order'
      case 'in_transit': return 'On The Way'
      case 'delivered': return 'Delivered'
      default: return 'Unknown'
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-white'>Order Tracking</h2>
            <p className='text-green-100'>Order ID: {orderId}</p>
          </div>
          <MdClose className='w-6 h-6 text-white cursor-pointer hover:opacity-80' onClick={onClose} />
        </div>

        <div className='p-6 space-y-6'>
          {/* Status Progress */}
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-semibold text-gray-800 dark:text-white'>Order Status</h3>
              <span className={`${getStatusColor()} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                {getStatusText()}
              </span>
            </div>
            <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
              <div 
                className={`h-full ${getStatusColor()} transition-all duration-500`}
                style={{ width: `${deliveryData.progress}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2'>
              <span>Order Placed</span>
              <span>Preparing</span>
              <span>On The Way</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Map Simulation */}
          <div className='bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-80 relative border-2 border-gray-300 dark:border-gray-600'>
            {/* Simple Map Display */}
            <div className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center relative overflow-hidden'>
              {/* Map Background Pattern */}
              <svg className='absolute inset-0 w-full h-full opacity-10' viewBox='0 0 100 100'>
                <defs>
                  <pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'>
                    <path d='M 10 0 L 0 0 0 10' fill='none' stroke='currentColor' strokeWidth='0.5' />
                  </pattern>
                </defs>
                <rect width='100' height='100' fill='url(#grid)' />
              </svg>

              {/* Restaurant Marker */}
              <div className='absolute top-1/4 left-1/4 flex flex-col items-center group cursor-pointer z-10'>
                <div className='bg-red-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform'>
                  🏪
                </div>
                <div className='mt-1 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                  {deliveryData.restaurant.name}
                </div>
              </div>

              {/* Delivery Partner Marker (animated) */}
              <div 
                className='absolute flex flex-col items-center group cursor-pointer z-20 transition-all duration-500'
                style={{
                  left: `${25 + (deliveryData.progress / 100) * 50}%`,
                  top: `${30 + Math.sin(deliveryData.progress / 10) * 10}%`
                }}
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-orange-400 rounded-full animate-pulse'></div>
                  <div className='bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform relative z-10'>
                    🏍️
                  </div>
                </div>
                <div className='mt-1 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                  Delivery Partner
                </div>
              </div>

              {/* Delivery Address Marker */}
              <div className='absolute bottom-1/4 right-1/4 flex flex-col items-center group cursor-pointer z-10'>
                <div className='bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform'>
                  📍
                </div>
                <div className='mt-1 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                  Your Location
                </div>
              </div>

              {/* Route Line */}
              <svg className='absolute inset-0 w-full h-full pointer-events-none' style={{ opacity: 0.3 }}>
                <line x1='25%' y1='25%' x2={`${25 + (deliveryData.progress / 100) * 50}%`} y2='30%' 
                      stroke='#3b82f6' strokeWidth='2' strokeDasharray='5,5' />
              </svg>
            </div>
          </div>

          {/* Delivery Info Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Delivery Partner Info */}
            <div className='bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4'>
              <h4 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                <span className='text-xl'>🏍️</span> Delivery Partner
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Name:</span>
                  <span className='font-semibold text-gray-800 dark:text-white'>{deliveryData.deliveryPartner.name}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Rating:</span>
                  <span className='font-semibold text-yellow-500'>⭐ {deliveryData.deliveryPartner.rating}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Vehicle:</span>
                  <span className='font-semibold text-gray-800 dark:text-white'>{deliveryData.deliveryPartner.vehicle}</span>
                </div>
                <button className='w-full mt-3 px-3 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 flex items-center justify-center gap-2'>
                  <FaPhone className='w-3 h-3' /> Call
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            <div className='bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4'>
              <h4 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                <span className='text-xl'>🕐</span> Delivery Details
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Est. Time:</span>
                  <span className='font-semibold text-gray-800 dark:text-white'>{deliveryData.estimatedTime} mins</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Distance:</span>
                  <span className='font-semibold text-gray-800 dark:text-white'>{deliveryData.distance} km</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Progress:</span>
                  <span className='font-semibold text-gray-800 dark:text-white'>{Math.round(deliveryData.progress)}%</span>
                </div>
                <button className='w-full mt-3 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700'>
                  Share Status
                </button>
              </div>
            </div>
          </div>

          {/* Status Update Buttons */}
          <div className='flex gap-2'>
            <button
              onClick={() => updateStatus('preparing')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                deliveryData.status === 'preparing'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Preparing
            </button>
            <button
              onClick={() => updateStatus('in_transit')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                deliveryData.status === 'in_transit'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => updateStatus('delivered')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                deliveryData.status === 'delivered'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryMap
