import React, { createContext, useState, useEffect } from 'react'
import { food_items } from '../food'
export const dataContext = createContext()

const PROFILES_KEY = 'user_profiles_v1'

function UserContext({ children }) {
    const [allItems, setAllItems] = useState(food_items)
    const [cate, setCate] = useState(food_items)
    const [input, setInput] = useState('')
    const [showCart, setShowCart] = useState(false)
    const [user, setUser] = useState(null)
    const [favorites, setFavorites] = useState([])
    const [showFavorites, setShowFavorites] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [currentPage, setCurrentPage] = useState('home')
    const [vegFilter, setVegFilter] = useState('all')
    const [sortOrder, setSortOrder] = useState('default')
    const [priceRange, setPriceRange] = useState([0, 1500])
    const [ratings, setRatings] = useState(() => {
        try { const r = localStorage.getItem('food_ratings'); return r ? JSON.parse(r) : {} } catch { return {} }
    })
    const [selectedItem, setSelectedItem] = useState(null)
    const [orderStatuses, setOrderStatuses] = useState({})
    const [notifications, setNotifications] = useState([])
    const [profiles, setProfiles] = useState(() => {
        try { const p = localStorage.getItem(PROFILES_KEY); return p ? JSON.parse(p) : null } catch { return null }
    })

    useEffect(() => {
        const savedFavorites = localStorage.getItem('foodFavorites')
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark')
        } else {
            setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('foodFavorites', JSON.stringify(favorites))
    }, [favorites])

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light')
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark')
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.setAttribute('data-theme', 'light')
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    useEffect(() => {
        try { localStorage.setItem('food_ratings', JSON.stringify(ratings)) } catch {}
    }, [ratings])

    useEffect(() => {
        if (profiles) {
            try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)) } catch {}
        }
    }, [profiles])

    const toggleFavorite = (itemId) => {
        setFavorites(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        )
    }

    const toggleTheme = () => {
        setDarkMode(prev => {
            const next = !prev
            document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
            document.documentElement.classList.toggle('dark', next)
            return next
        })
    }

    const rateItem = (itemId, stars) => {
        setRatings(prev => {
            const existing = prev[itemId] || { total: 0, count: 0 }
            return { ...prev, [itemId]: { total: existing.total + stars, count: existing.count + 1 } }
        })
    }

    const addNotification = (message, type = 'info') => {
        const notif = { id: Date.now(), message, type, time: new Date().toLocaleTimeString() }
        setNotifications(prev => [notif, ...prev].slice(0, 20))
    }

    const clearNotifications = () => setNotifications([])

    function applyFiltersAndSort(base) {
        let result = [...base]
        if (vegFilter !== 'all') result = result.filter(i => i.food_type === vegFilter)
        result = result.filter(i => i.price >= priceRange[0] && i.price <= priceRange[1])
        if (sortOrder === 'price_asc') result.sort((a, b) => a.price - b.price)
        else if (sortOrder === 'price_desc') result.sort((a, b) => b.price - a.price)
        else if (sortOrder === 'name_asc') result.sort((a, b) => a.food_name.localeCompare(b.food_name))
        return result
    }

    useEffect(() => {
        let base = allItems
        if (showFavorites && favorites.length > 0) base = allItems.filter(item => favorites.includes(item.id))
        if (input.trim()) base = base.filter(item => item.food_name.toLowerCase().includes(input.toLowerCase()))
        setCate(applyFiltersAndSort(base))
    }, [showFavorites, favorites, input, allItems, vegFilter, sortOrder, priceRange])

    const data = {
        allItems, setAllItems,
        input, setInput,
        cate, setCate,
        showCart, setShowCart,
        user, setUser,
        favorites, toggleFavorite,
        showFavorites, setShowFavorites,
        darkMode, toggleTheme,
        currentPage, setCurrentPage,
        vegFilter, setVegFilter,
        sortOrder, setSortOrder,
        priceRange, setPriceRange,
        ratings, rateItem,
        selectedItem, setSelectedItem,
        orderStatuses, setOrderStatuses,
        notifications, addNotification, clearNotifications,
        profiles, setProfiles
    }

    return (
        <dataContext.Provider value={data}>
            {children}
        </dataContext.Provider>
    )
}

export default UserContext
