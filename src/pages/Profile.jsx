import { useContext, useState } from 'react'
import { dataContext } from '../context/UserContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { MdEdit, MdLocationOn, MdPhone, MdEmail, MdHistory, MdAdd, MdDelete, MdArrowBack, MdSave, MdCancel } from 'react-icons/md'
import { FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'

const DEFAULT_PROFILE = (userId) => ({
    id: 1,
    name: userId || 'User',
    email: '',
    phone: '',
    address: ''
})

function Profile() {
    const { user, setCurrentPage, profiles, setProfiles, favorites } = useContext(dataContext)

    const initProfiles = profiles || [DEFAULT_PROFILE(user?.userId)]

    const [localProfiles, setLocalProfiles] = useState(initProfiles)
    const [activeProfileId, setActiveProfileId] = useState(initProfiles[0].id)
    const [profileData, setProfileData] = useState(initProfiles[0])
    const [isEditing, setIsEditing] = useState(false)
    const [showAddProfile, setShowAddProfile] = useState(false)
    const [newProfileName, setNewProfileName] = useState('')

    const persist = (updated) => {
        setLocalProfiles(updated)
        setProfiles(updated)
    }

    const handleSave = () => {
        const updated = localProfiles.map(p => p.id === activeProfileId ? profileData : p)
        persist(updated)
        setIsEditing(false)
        toast.success('Profile saved!')
    }

    const handleAddProfile = () => {
        if (!newProfileName.trim()) return
        const newProfile = {
            id: Math.max(...localProfiles.map(p => p.id), 0) + 1,
            name: newProfileName,
            email: '', phone: '', address: ''
        }
        persist([...localProfiles, newProfile])
        setActiveProfileId(newProfile.id)
        setProfileData(newProfile)
        setNewProfileName('')
        setShowAddProfile(false)
        toast.success('Profile created!')
    }

    const handleDeleteProfile = (id) => {
        if (localProfiles.length === 1) { toast.error('Must have at least one profile'); return }
        const updated = localProfiles.filter(p => p.id !== id)
        persist(updated)
        if (activeProfileId === id) {
            setActiveProfileId(updated[0].id)
            setProfileData(updated[0])
        }
        toast.success('Profile deleted')
    }

    const handleSwitchProfile = (id) => {
        const p = localProfiles.find(p => p.id === id)
        if (p) { setActiveProfileId(id); setProfileData(p); setIsEditing(false) }
    }

    // Real stats from localStorage
    const orders = (() => { try { return JSON.parse(localStorage.getItem('order_history_v1') || '[]') } catch { return [] } })()
    const memberSince = (() => { try { const u = JSON.parse(localStorage.getItem('app_users_v1') || '{}'); return u[user?.userId] ? 'Registered' : 'Guest' } catch { return 'N/A' } })()

    return (
        <div className='bg-white dark:bg-gray-900 w-full min-h-screen transition-colors'>
            <Nav />
            <div className='max-w-4xl mx-auto px-5 py-8'>
                <button onClick={() => setCurrentPage('home')}
                    className='flex items-center gap-2 px-4 py-2 mb-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                    <MdArrowBack className='w-5 h-5' />Back to Home
                </button>
                <h1 className='text-3xl font-bold text-center text-green-600 dark:text-green-400 mb-8'>My Profile</h1>

                {/* Profile Selector */}
                <div className='mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>My Profiles</h2>
                        <button onClick={() => setShowAddProfile(p => !p)}
                            className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                            <MdAdd className='w-4 h-4' />Add Profile
                        </button>
                    </div>

                    {showAddProfile && (
                        <div className='mb-4 pb-4 border-b border-gray-200 dark:border-gray-700'>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    placeholder='Profile name (e.g., Home, Office)'
                                    value={newProfileName}
                                    onChange={e => setNewProfileName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddProfile()}
                                    className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                                />
                                <button onClick={handleAddProfile} className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>Create</button>
                                <button onClick={() => setShowAddProfile(false)} className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {localProfiles.map(profile => (
                            <div key={profile.id} onClick={() => handleSwitchProfile(profile.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${activeProfileId === profile.id ? 'border-green-500 bg-green-50 dark:bg-green-900' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
                                <div className='flex justify-between items-start'>
                                    <div className='flex-1'>
                                        <p className='font-semibold text-gray-800 dark:text-white'>{profile.name}</p>
                                        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{profile.phone || 'No phone'}</p>
                                        <p className='text-sm text-gray-500 dark:text-gray-400'>{profile.email || 'No email'}</p>
                                    </div>
                                    {localProfiles.length > 1 && (
                                        <button onClick={e => { e.stopPropagation(); handleDeleteProfile(profile.id) }}
                                            className='ml-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors'>
                                            <MdDelete className='w-5 h-5' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Personal Info */}
                    <div className='lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
                        <div className='flex justify-between items-center mb-6'>
                            <div>
                                <h2 className='text-2xl font-semibold text-gray-800 dark:text-white'>Personal Information</h2>
                                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Profile: <span className='font-semibold text-green-600 dark:text-green-400'>{profileData.name}</span></p>
                            </div>
                            <div className='flex gap-2'>
                                {isEditing && (
                                    <button onClick={() => setIsEditing(false)}
                                        className='flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'>
                                        <MdCancel className='w-4 h-4' />Cancel
                                    </button>
                                )}
                                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                                    {isEditing ? <><MdSave className='w-4 h-4' />Save</> : <><MdEdit className='w-4 h-4' />Edit</>}
                                </button>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            {[
                                { icon: <FaUser className='w-5 h-5 text-green-500' />, label: 'Full Name', field: 'name', type: 'text' },
                                { icon: <MdEmail className='w-5 h-5 text-green-500' />, label: 'Email', field: 'email', type: 'email' },
                                { icon: <MdPhone className='w-5 h-5 text-green-500' />, label: 'Phone', field: 'phone', type: 'tel' },
                            ].map(({ icon, label, field, type }) => (
                                <div key={field} className='flex items-center gap-4'>
                                    {icon}
                                    {isEditing ? (
                                        <input type={type} value={profileData[field]}
                                            onChange={e => setProfileData(prev => ({ ...prev, [field]: e.target.value }))}
                                            className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white' />
                                    ) : (
                                        <div>
                                            <p className='text-xs text-gray-400'>{label}</p>
                                            <p className='text-base font-medium text-gray-800 dark:text-white'>{profileData[field] || <span className='text-gray-400 italic'>Not set</span>}</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className='flex items-start gap-4'>
                                <MdLocationOn className='w-5 h-5 text-green-500 mt-1' />
                                {isEditing ? (
                                    <textarea value={profileData.address}
                                        onChange={e => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                        rows={3}
                                        className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white' />
                                ) : (
                                    <div>
                                        <p className='text-xs text-gray-400'>Address</p>
                                        <p className='text-base font-medium text-gray-800 dark:text-white'>{profileData.address || <span className='text-gray-400 italic'>Not set</span>}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='space-y-6'>
                        {/* Quick Actions */}
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
                            <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-4'>Quick Actions</h3>
                            <div className='space-y-3'>
                                <button onClick={() => setCurrentPage('home')}
                                    className='w-full flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'>
                                    <MdHistory className='w-5 h-5' />View Orders
                                </button>
                                <button onClick={() => setCurrentPage('home')}
                                    className='w-full flex items-center gap-3 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors'>
                                    <MdLocationOn className='w-5 h-5' />Browse Menu
                                </button>
                            </div>
                        </div>

                        {/* Real Account Stats */}
                        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
                            <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-4'>Account Stats</h3>
                            <div className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500 dark:text-gray-400'>Total Orders</span>
                                    <span className='font-bold text-gray-800 dark:text-white'>{orders.length}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500 dark:text-gray-400'>Favorite Items</span>
                                    <span className='font-bold text-gray-800 dark:text-white'>{favorites.length}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500 dark:text-gray-400'>Logged in as</span>
                                    <span className='font-bold text-green-600 dark:text-green-400'>{user?.userId}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500 dark:text-gray-400'>Role</span>
                                    <span className={`font-bold capitalize ${user?.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Profile
