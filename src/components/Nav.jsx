import { useContext, useState, useRef, useEffect } from 'react'
import { MdFastfood, MdDarkMode, MdLightMode, MdPerson, MdAdminPanelSettings, MdLogout, MdTune, MdNotifications, MdNotificationsNone, MdClose } from 'react-icons/md'
import { IoSearch } from 'react-icons/io5'
import { LuShoppingBag, LuLeafyGreen } from 'react-icons/lu'
import { AiFillHeart } from 'react-icons/ai'
import { GiChickenOven } from 'react-icons/gi'
import { dataContext } from '../context/UserContext'
import { useSelector } from 'react-redux'

function Nav() {
    const {
        input, setInput, allItems, setShowCart,
        favorites, showFavorites, setShowFavorites,
        darkMode, toggleTheme, currentPage, setCurrentPage, user, setUser,
        vegFilter, setVegFilter, sortOrder, setSortOrder, priceRange, setPriceRange,
        notifications, clearNotifications, setSelectedItem
    } = useContext(dataContext)

    const [showFilters, setShowFilters] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const items = useSelector(state => state.cart)
    const searchRef = useRef(null)
    const notifRef = useRef(null)

    const unreadCount = notifications.length

    // Suggestions: match food names from allItems
    const suggestions = input.trim().length > 0
        ? allItems.filter(i => i.food_name.toLowerCase().includes(input.toLowerCase())).slice(0, 6)
        : []

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false)
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSuggestionClick = (item) => {
        setInput(item.food_name)
        setShowSuggestions(false)
        setSelectedItem(item)
    }

    const handleLogout = () => { setUser(null); setCurrentPage('home') }

    const notifColors = { info: 'text-blue-500', success: 'text-green-500', warning: 'text-yellow-500', error: 'text-red-500' }

    return (
        <div className='w-full bg-white dark:bg-gray-800 transition-colors shadow-sm'>
            <div className='w-full h-[80px] flex justify-between items-center px-5 md:px-8 gap-3'>

                {/* Favorites / Logo */}
                <div
                    className={`w-[50px] h-[50px] bg-white dark:bg-gray-700 flex justify-center items-center rounded-md shadow-xl relative cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-600 flex-shrink-0 ${favorites.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={() => favorites.length > 0 && setShowFavorites(!showFavorites)}
                    title={showFavorites ? 'Show all items' : 'Show favorites'}
                >
                    {showFavorites ? <AiFillHeart className='w-6 h-6 text-red-500' /> : <MdFastfood className='w-6 h-6 text-green-500' />}
                    {favorites.length > 0 && !showFavorites && (
                        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>{favorites.length}</span>
                    )}
                </div>

                {/* Search with suggestions */}
                <div ref={searchRef} className='flex-1 relative'>
                    <form className='h-[50px] bg-white dark:bg-gray-700 flex items-center px-4 gap-3 rounded-md shadow-md' onSubmit={e => e.preventDefault()}>
                        <IoSearch className='text-green-500 w-5 h-5 flex-shrink-0' />
                        <input
                            type='text'
                            placeholder='Search Items...'
                            className='w-full outline-none text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                            onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
                            onFocus={() => setShowSuggestions(true)}
                            value={input}
                        />
                        {input && (
                            <button type='button' onClick={() => { setInput(''); setShowSuggestions(false) }}>
                                <MdClose className='w-4 h-4 text-gray-400 hover:text-gray-600' />
                            </button>
                        )}
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className='absolute top-[54px] left-0 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100 dark:border-gray-600'>
                            {suggestions.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSuggestionClick(item)}
                                    className='flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 dark:hover:bg-gray-600 cursor-pointer transition-colors'
                                >
                                    <img src={item.food_image} alt={item.food_name} className='w-9 h-9 rounded-lg object-cover flex-shrink-0' />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-semibold text-gray-800 dark:text-white truncate'>{item.food_name}</p>
                                        <p className='text-xs text-gray-400 capitalize'>{item.food_category.replace('_', ' ')}</p>
                                    </div>
                                    <span className='text-sm font-bold text-green-500 flex-shrink-0'>Rs {item.price}/-</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter Toggle */}
                <div
                    className={`w-[50px] h-[50px] flex justify-center items-center rounded-md shadow-xl cursor-pointer transition-colors flex-shrink-0 ${showFilters ? 'bg-green-500' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    onClick={() => setShowFilters(p => !p)}
                >
                    <MdTune className={`w-6 h-6 ${showFilters ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                </div>

                {/* Theme */}
                <div className='w-[50px] h-[50px] bg-white dark:bg-gray-700 flex justify-center items-center rounded-md shadow-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0' onClick={toggleTheme}>
                    {darkMode ? <MdLightMode className='w-6 h-6 text-yellow-500' /> : <MdDarkMode className='w-6 h-6 text-gray-600' />}
                </div>

                {/* Notifications */}
                <div ref={notifRef} className='relative flex-shrink-0'>
                    <div
                        className='w-[50px] h-[50px] bg-white dark:bg-gray-700 flex justify-center items-center rounded-md shadow-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors relative'
                        onClick={() => setShowNotifications(p => !p)}
                        title='Notifications'
                    >
                        {unreadCount > 0
                            ? <MdNotifications className='w-6 h-6 text-green-500' />
                            : <MdNotificationsNone className='w-6 h-6 text-gray-500' />}
                        {unreadCount > 0 && (
                            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </div>

                    {/* Notifications Panel */}
                    {showNotifications && (
                        <div className='absolute top-[58px] right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden'>
                            <div className='flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700'>
                                <span className='font-semibold text-gray-800 dark:text-white'>Notifications</span>
                                {notifications.length > 0 && (
                                    <button onClick={clearNotifications} className='text-xs text-red-500 hover:underline'>Clear all</button>
                                )}
                            </div>
                            <div className='max-h-72 overflow-y-auto'>
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className='flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'>
                                        <span className={`mt-0.5 text-lg ${notifColors[n.type] || 'text-blue-500'}`}>
                                            {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                                        </span>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm text-gray-700 dark:text-gray-300'>{n.message}</p>
                                            <p className='text-xs text-gray-400 mt-0.5'>{n.time}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className='flex flex-col items-center py-8 gap-2'>
                                        <MdNotificationsNone className='w-10 h-10 text-gray-300' />
                                        <p className='text-sm text-gray-400'>No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div
                    className={`w-[50px] h-[50px] flex justify-center items-center rounded-md shadow-xl cursor-pointer transition-colors flex-shrink-0 ${currentPage === 'profile' ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    onClick={() => setCurrentPage('profile')}
                >
                    <MdPerson className='w-6 h-6 text-blue-500' />
                </div>

                {/* Admin */}
                {user?.role === 'admin' && (
                    <div
                        className={`w-[50px] h-[50px] flex justify-center items-center rounded-md shadow-xl cursor-pointer transition-colors flex-shrink-0 ${currentPage === 'admin' ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                        onClick={() => setCurrentPage('admin')}
                    >
                        <MdAdminPanelSettings className='w-6 h-6 text-purple-500' />
                    </div>
                )}

                {/* Cart */}
                <div
                    className='w-[50px] h-[50px] bg-white dark:bg-gray-700 flex justify-center items-center rounded-md shadow-xl relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0'
                    onClick={() => setShowCart(true)}
                >
                    <span className='absolute top-0 right-1 text-green-500 font-bold text-sm'>{items.length}</span>
                    <LuShoppingBag className='w-6 h-6 text-green-500' />
                </div>

                {/* Logout */}
                <div
                    className='w-[50px] h-[50px] bg-white dark:bg-gray-700 flex justify-center items-center rounded-md shadow-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900 transition-colors flex-shrink-0'
                    onClick={handleLogout}
                    title='Logout'
                >
                    <MdLogout className='w-6 h-6 text-red-500' />
                </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
                <div className='w-full px-5 md:px-8 pb-4 flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700'>
                    <div className='flex gap-2'>
                        {[
                            { val: 'all', label: 'All' },
                            { val: 'veg', label: 'Veg', icon: <LuLeafyGreen className='text-green-500' /> },
                            { val: 'non_veg', label: 'Non-Veg', icon: <GiChickenOven className='text-orange-500' /> }
                        ].map(({ val, label, icon }) => (
                            <button key={val} onClick={() => setVegFilter(val)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${vegFilter === val ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>
                                {icon}{label}
                            </button>
                        ))}
                    </div>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                        className='px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm'>
                        <option value='default'>Sort: Default</option>
                        <option value='price_asc'>Price: Low → High</option>
                        <option value='price_desc'>Price: High → Low</option>
                        <option value='name_asc'>Name: A → Z</option>
                    </select>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>Price:</span>
                        <span className='text-sm font-semibold text-green-600'>Rs {priceRange[0]}</span>
                        <input type='range' min={0} max={1500} step={50} value={priceRange[1]}
                            onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className='w-28 accent-green-500' />
                        <span className='text-sm font-semibold text-green-600'>Rs {priceRange[1]}</span>
                        <button onClick={() => setPriceRange([0, 1500])} className='text-xs text-gray-400 hover:text-red-500 transition-colors'>Reset</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Nav
