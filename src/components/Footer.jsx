import React from 'react'
import { MdFastfood, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

function Footer() {
  return (
    <footer className='w-full bg-gray-800 dark:bg-gray-900 text-white py-12 mt-16 transition-colors'>
      <div className='max-w-6xl mx-auto px-5'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center gap-3 mb-4'>
              <MdFastfood className='w-8 h-8 text-green-500' />
              <h3 className='text-2xl font-bold'>FoodieHub</h3>
            </div>
            <p className='text-gray-300 mb-4'>
              Delicious food delivered to your doorstep. Fresh ingredients, amazing taste,
              and lightning-fast delivery. Your satisfaction is our priority.
            </p>
            <div className='flex gap-4'>
              <FaFacebook className='w-6 h-6 text-gray-300 hover:text-green-500 cursor-pointer transition-colors' />
              <FaTwitter className='w-6 h-6 text-gray-300 hover:text-green-500 cursor-pointer transition-colors' />
              <FaInstagram className='w-6 h-6 text-gray-300 hover:text-green-500 cursor-pointer transition-colors' />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='text-lg font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2'>
              <li><a href="#" className='text-gray-300 dark:text-gray-400 hover:text-green-500 transition-colors'>About Us</a></li>
              <li><a href="#" className='text-gray-300 dark:text-gray-400 hover:text-green-500 transition-colors'>Menu</a></li>
              <li><a href="#" className='text-gray-300 dark:text-gray-400 hover:text-green-500 transition-colors'>My Profile</a></li>
              <li><a href="#" className='text-gray-300 dark:text-gray-400 hover:text-green-500 transition-colors'>Admin Dashboard</a></li>
              <li><a href="#" className='text-gray-300 dark:text-gray-400 hover:text-green-500 transition-colors'>Offers</a></li>
              <li><a href="#" className='text-gray-300 dark:text-gray-400 hover:text-green-500 transition-colors'>Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className='text-lg font-semibold mb-4'>Contact Info</h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <MdLocationOn className='w-5 h-5 text-green-500' />
                <span className='text-gray-300'>123 Food Street, Sonipat, Haryana 13105</span>
              </div>
              <div className='flex items-center gap-3'>
                <MdPhone className='w-5 h-5 text-green-500' />
                <span className='text-gray-300'>+91 7988541082    </span>
              </div>
              <div className='flex items-center gap-3'>
                <MdEmail className='w-5 h-5 text-green-500' />
                <span className='text-gray-300'>info@foodiehub.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-gray-400 text-sm'>
            © 2026 FoodieHub. All rights reserved.
          </p>
          <div className='flex gap-6 mt-4 md:mt-0'>
            <a href="#" className='text-gray-400 hover:text-green-500 text-sm transition-colors'>Privacy Policy</a>
            <a href="#" className='text-gray-400 hover:text-green-500 text-sm transition-colors'>Terms of Service</a>
            <a href="#" className='text-gray-400 hover:text-green-500 text-sm transition-colors'>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer