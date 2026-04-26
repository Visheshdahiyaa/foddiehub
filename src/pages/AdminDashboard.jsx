import { useContext, useState } from 'react'
import { dataContext } from '../context/UserContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { loadUsers, saveUsers } from './Login'
import { readDB } from '../services/db'
import { toast } from 'react-toastify'
import {
    MdDashboard, MdRestaurantMenu, MdShoppingCart, MdPeople,
    MdAdd, MdEdit, MdDelete, MdAnalytics, MdArrowBack, MdSave,
    MdCancel, MdAdminPanelSettings, MdPerson, MdLock, MdPersonAdd
} from 'react-icons/md'

const EMPTY_FORM = { food_name: '', food_category: 'breakfast', food_type: 'veg', price: '', food_image: '' }

function AdminDashboard() {
    const { setCurrentPage, allItems, setAllItems, user } = useContext(dataContext)
    const [activeTab, setActiveTab] = useState('dashboard')

    // Menu state
    const [editingItem, setEditingItem] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [editForm, setEditForm] = useState(EMPTY_FORM)

    // User management state — live from localStorage
    const [users, setUsers] = useState(() => loadUsers())

    // Sync users from JSONBin on mount
    useState(() => {
        readDB().then(db => {
            if (db?.users) {
                const normalized = {}
                Object.entries(db.users).forEach(([id, val]) => {
                    normalized[id] = typeof val === 'string' ? { password: val, role: 'user' } : val
                })
                if (!normalized['admin'] || normalized['admin'].role !== 'admin') {
                    normalized['admin'] = { password: 'admin123', role: 'admin' }
                }
                setUsers(normalized)
                saveUsers(normalized)
            }
        }).catch(() => {})
    })
    const [showAddUser, setShowAddUser] = useState(false)
    const [newUserId, setNewUserId] = useState('')
    const [newUserPw, setNewUserPw] = useState('')
    const [newUserRole, setNewUserRole] = useState('user')
    const [resetPwTarget, setResetPwTarget] = useState(null)
    const [resetPwValue, setResetPwValue] = useState('')

    const persistUsers = (updated) => {
        setUsers(updated)
        saveUsers(updated)
    }

    // Orders from localStorage
    const orders = (() => {
        try {
            const raw = localStorage.getItem('order_history_v1')
            return raw ? JSON.parse(raw) : []
        } catch { return [] }
    })()

    const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + (o.total || 0), 0),
        totalUsers: Object.keys(users).length,
        totalMenuItems: allItems.length
    }

    // ── Menu handlers ──────────────────────────────────────────
    const handleDeleteMenuItem = (id) => {
        if (!confirm('Delete this item?')) return
        setAllItems(prev => prev.filter(item => item.id !== id))
        toast.success('Item deleted')
    }

    const handleEditMenuItem = (item) => {
        setEditingItem(item)
        setEditForm({ food_name: item.food_name, food_category: item.food_category, food_type: item.food_type, price: item.price, food_image: item.food_image })
        setIsEditing(true)
        setIsAdding(false)
    }

    const handleSaveEdit = () => {
        if (!editForm.food_name.trim()) { toast.error('Name is required'); return }
        setAllItems(prev => prev.map(item =>
            item.id === editingItem.id ? { ...item, ...editForm, price: Number(editForm.price) } : item
        ))
        setIsEditing(false); setEditingItem(null)
        toast.success('Item updated')
    }

    const handleOpenAddForm = () => {
        setIsAdding(true); setIsEditing(false); setEditingItem(null); setEditForm(EMPTY_FORM)
    }

    const handleAddMenuItem = () => {
        if (!editForm.food_name.trim()) { toast.error('Name is required'); return }
        const nextId = allItems.reduce((max, item) => Math.max(max, item.id), 0) + 1
        setAllItems(prev => [...prev, {
            id: nextId,
            food_name: editForm.food_name,
            food_category: editForm.food_category,
            food_type: editForm.food_type,
            price: Number(editForm.price) || 0,
            food_image: editForm.food_image || 'https://placehold.co/300x200?text=Food',
            food_quantity: 1
        }])
        setIsAdding(false); setEditForm(EMPTY_FORM)
        toast.success('Item added')
    }

    // ── User handlers ──────────────────────────────────────────
    const handleAddUser = () => {
        if (!newUserId.trim() || !newUserPw.trim()) { toast.error('UserID and password are required'); return }
        if (users[newUserId]) { toast.error('UserID already exists'); return }
        if (newUserPw.length < 4) { toast.error('Password must be at least 4 characters'); return }
        persistUsers({ ...users, [newUserId]: { password: newUserPw, role: newUserRole } })
        setNewUserId(''); setNewUserPw(''); setNewUserRole('user'); setShowAddUser(false)
        toast.success(`User "${newUserId}" created`)
    }

    const handleDeleteUser = (id) => {
        if (id === user?.userId) { toast.error("You can't delete your own account"); return }
        if (!confirm(`Delete user "${id}"?`)) return
        const next = { ...users }
        delete next[id]
        persistUsers(next)
        toast.success(`User "${id}" deleted`)
    }

    const handleToggleRole = (id) => {
        if (id === user?.userId) { toast.error("You can't change your own role"); return }
        const current = users[id].role
        const next = { ...users, [id]: { ...users[id], role: current === 'admin' ? 'user' : 'admin' } }
        persistUsers(next)
        toast.success(`"${id}" is now ${current === 'admin' ? 'user' : 'admin'}`)
    }

    const handleResetPassword = (id) => {
        if (!resetPwValue.trim() || resetPwValue.length < 4) { toast.error('Password must be at least 4 characters'); return }
        persistUsers({ ...users, [id]: { ...users[id], password: resetPwValue } })
        setResetPwTarget(null); setResetPwValue('')
        toast.success(`Password reset for "${id}"`)
    }

    // ── Render helpers ─────────────────────────────────────────
    const ItemForm = () => (
        <div className='mb-6 p-4 border border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>{isAdding ? 'Add Menu Item' : 'Edit Menu Item'}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {[
                    { label: 'Name', key: 'food_name', type: 'text' },
                    { label: 'Price (Rs)', key: 'price', type: 'number' },
                ].map(({ label, key, type }) => (
                    <div key={key}>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>{label}</label>
                        <input type={type} value={editForm[key]}
                            onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500' />
                    </div>
                ))}
                <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Category</label>
                    <select value={editForm.food_category} onChange={e => setEditForm({ ...editForm, food_category: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500'>
                        {['breakfast', 'soups', 'pasta', 'main_course', 'pizza', 'burger'].map(c => (
                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Type</label>
                    <select value={editForm.food_type} onChange={e => setEditForm({ ...editForm, food_type: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500'>
                        <option value='veg'>Vegetarian</option>
                        <option value='non_veg'>Non-Vegetarian</option>
                    </select>
                </div>
                <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Image URL</label>
                    <input type='text' value={editForm.food_image}
                        onChange={e => setEditForm({ ...editForm, food_image: e.target.value })}
                        placeholder='https://...'
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500' />
                </div>
            </div>
            <div className='flex gap-2 mt-4'>
                <button onClick={isAdding ? handleAddMenuItem : handleSaveEdit}
                    className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                    <MdSave className='w-4 h-4' />{isAdding ? 'Add Item' : 'Save'}
                </button>
                <button onClick={() => { setIsEditing(false); setIsAdding(false); setEditingItem(null) }}
                    className='flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'>
                    <MdCancel className='w-4 h-4' />Cancel
                </button>
            </div>
        </div>
    )

    const renderDashboard = () => (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
                { label: 'Total Orders', value: stats.totalOrders, icon: <MdShoppingCart className='w-8 h-8 text-green-500' /> },
                { label: 'Total Revenue', value: `Rs ${stats.totalRevenue.toLocaleString()}`, icon: <MdAnalytics className='w-8 h-8 text-blue-500' /> },
                { label: 'Registered Users', value: stats.totalUsers, icon: <MdPeople className='w-8 h-8 text-purple-500' /> },
                { label: 'Menu Items', value: stats.totalMenuItems, icon: <MdRestaurantMenu className='w-8 h-8 text-orange-500' /> },
            ].map(({ label, value, icon }) => (
                <div key={label} className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between'>
                    <div>
                        <p className='text-gray-500 dark:text-gray-400 text-sm'>{label}</p>
                        <p className='text-2xl font-bold text-gray-800 dark:text-white mt-1'>{value}</p>
                    </div>
                    {icon}
                </div>
            ))}
        </div>
    )

    const renderMenuManagement = () => (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-semibold text-gray-800 dark:text-white'>Menu Management</h2>
                <button onClick={handleOpenAddForm}
                    className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                    <MdAdd className='w-4 h-4' />Add Item
                </button>
            </div>
            {(isEditing || isAdding) && <ItemForm />}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {allItems.map(item => (
                    <div key={item.id} className='border border-gray-200 dark:border-gray-600 rounded-lg p-4'>
                        <img src={item.food_image} alt={item.food_name} className='w-full h-32 object-cover rounded-lg mb-3' />
                        <h3 className='font-semibold text-gray-800 dark:text-white mb-1'>{item.food_name}</h3>
                        <p className='text-green-600 dark:text-green-400 font-bold mb-1'>Rs {item.price}/-</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mb-3 capitalize'>{item.food_category.replace('_', ' ')} · {item.food_type}</p>
                        <div className='flex gap-2'>
                            <button onClick={() => handleEditMenuItem(item)}
                                className='flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors'>
                                <MdEdit className='w-4 h-4' />Edit
                            </button>
                            <button onClick={() => handleDeleteMenuItem(item.id)}
                                className='flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors'>
                                <MdDelete className='w-4 h-4' />Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderUserManagement = () => (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-semibold text-gray-800 dark:text-white'>User Management</h2>
                <button onClick={() => setShowAddUser(p => !p)}
                    className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                    <MdPersonAdd className='w-4 h-4' />Add User
                </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
                <div className='mb-6 p-4 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20'>
                    <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>Create New User</h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>UserID</label>
                            <input value={newUserId} onChange={e => setNewUserId(e.target.value)}
                                placeholder='Enter UserID'
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-400' />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Password</label>
                            <input type='password' value={newUserPw} onChange={e => setNewUserPw(e.target.value)}
                                placeholder='Enter password'
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-400' />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Role</label>
                            <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-400'>
                                <option value='user'>User</option>
                                <option value='admin'>Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className='flex gap-2 mt-4'>
                        <button onClick={handleAddUser}
                            className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                            <MdSave className='w-4 h-4' />Create User
                        </button>
                        <button onClick={() => setShowAddUser(false)}
                            className='flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'>
                            <MdCancel className='w-4 h-4' />Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className='overflow-x-auto'>
                <table className='w-full'>
                    <thead>
                        <tr className='border-b border-gray-200 dark:border-gray-600 text-left'>
                            {['UserID', 'Role', 'Actions'].map(h => (
                                <th key={h} className='py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400'>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(users).map(([id, data]) => (
                            <tr key={id} className='border-b border-gray-100 dark:border-gray-700'>
                                <td className='py-3 px-4'>
                                    <div className='flex items-center gap-2'>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-green-100 dark:bg-green-900'}`}>
                                            {data.role === 'admin'
                                                ? <MdAdminPanelSettings className='w-4 h-4 text-purple-600 dark:text-purple-300' />
                                                : <MdPerson className='w-4 h-4 text-green-600 dark:text-green-300' />}
                                        </div>
                                        <span className='font-medium text-gray-800 dark:text-white'>{id}</span>
                                        {id === user?.userId && <span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full'>You</span>}
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${data.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                                        {data.role}
                                    </span>
                                </td>
                                <td className='py-3 px-4'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        {/* Promote/Demote */}
                                        <button onClick={() => handleToggleRole(id)}
                                            disabled={id === user?.userId}
                                            className={`flex items-center gap-1 px-3 py-1 text-xs rounded font-semibold transition-colors disabled:opacity-40 ${data.role === 'admin' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300'}`}>
                                            <MdAdminPanelSettings className='w-3 h-3' />
                                            {data.role === 'admin' ? 'Demote' : 'Promote'}
                                        </button>

                                        {/* Reset Password */}
                                        {resetPwTarget === id ? (
                                            <div className='flex items-center gap-1'>
                                                <input
                                                    type='password'
                                                    value={resetPwValue}
                                                    onChange={e => setResetPwValue(e.target.value)}
                                                    placeholder='New password'
                                                    className='px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white w-28'
                                                />
                                                <button onClick={() => handleResetPassword(id)}
                                                    className='px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600'>Save</button>
                                                <button onClick={() => { setResetPwTarget(null); setResetPwValue('') }}
                                                    className='px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500'>✕</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setResetPwTarget(id); setResetPwValue('') }}
                                                className='flex items-center gap-1 px-3 py-1 text-xs rounded font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition-colors'>
                                                <MdLock className='w-3 h-3' />Reset PW
                                            </button>
                                        )}

                                        {/* Delete */}
                                        <button onClick={() => handleDeleteUser(id)}
                                            disabled={id === user?.userId}
                                            className='flex items-center gap-1 px-3 py-1 text-xs rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition-colors disabled:opacity-40'>
                                            <MdDelete className='w-3 h-3' />Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderOrders = () => (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
            <h2 className='text-2xl font-semibold text-gray-800 dark:text-white mb-6'>Order History</h2>
            {orders.length > 0 ? (
                <div className='space-y-4'>
                    {orders.slice().reverse().map(ord => (
                        <div key={ord.id} className='border border-gray-200 dark:border-gray-600 rounded-lg p-4'>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <p className='font-semibold text-gray-800 dark:text-white text-sm'>{ord.id}</p>
                                    <p className='text-xs text-gray-500'>{new Date(ord.placedAt).toLocaleString()}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-bold text-green-600 dark:text-green-400'>Rs {ord.total}/-</p>
                                    <p className='text-xs text-gray-500'>{ord.items?.length || 0} items</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-center text-gray-500 dark:text-gray-400 py-8'>No orders yet</p>
            )}
        </div>
    )

    const SIDEBAR = [
        { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard className='w-5 h-5' /> },
        { id: 'menu', label: 'Menu Management', icon: <MdRestaurantMenu className='w-5 h-5' /> },
        { id: 'orders', label: 'Orders', icon: <MdShoppingCart className='w-5 h-5' /> },
        { id: 'users', label: 'User Management', icon: <MdPeople className='w-5 h-5' /> },
    ]

    return (
        <div className='bg-white dark:bg-gray-900 w-full min-h-screen transition-colors'>
            <Nav />
            <div className='max-w-7xl mx-auto px-5 py-8'>
                <button onClick={() => setCurrentPage('home')}
                    className='flex items-center gap-2 px-4 py-2 mb-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                    <MdArrowBack className='w-5 h-5' />Back to Home
                </button>

                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Sidebar */}
                    <div className='lg:w-64'>
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
                            <div className='flex items-center gap-2 mb-6'>
                                <MdAdminPanelSettings className='w-6 h-6 text-purple-500' />
                                <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>Admin Panel</h2>
                            </div>
                            <nav className='space-y-2'>
                                {SIDEBAR.map(({ id, label, icon }) => (
                                    <button key={id} onClick={() => setActiveTab(id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === id ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        {icon}{label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='flex-1'>
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'menu' && renderMenuManagement()}
                        {activeTab === 'orders' && renderOrders()}
                        {activeTab === 'users' && renderUserManagement()}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default AdminDashboard
