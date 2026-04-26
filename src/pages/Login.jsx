import { useState, useContext, useEffect } from 'react'
import { dataContext } from '../context/UserContext'
import { toast } from 'react-toastify'
import { MdAdminPanelSettings, MdPerson, MdPersonAdd, MdFastfood } from 'react-icons/md'
import { readDB, updateUsers } from '../services/db'

const USERS_KEY = 'app_users_v1'

const seedDemoUsers = () => ({
    admin: { password: 'admin123', role: 'admin' },
    user1: { password: 'pass123', role: 'user' }
})

function normalizeUsers(raw) {
    if (!raw || typeof raw !== 'object') return seedDemoUsers()
    return Object.fromEntries(Object.entries(raw).map(([id, val]) => {
        if (typeof val === 'string') return [id, { password: val, role: 'user' }]
        return [id, { password: val.password || '', role: val.role || 'user' }]
    }))
}

export function loadUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY)
        const parsed = raw ? JSON.parse(raw) : {}
        const normalized = normalizeUsers(parsed)
        if (!normalized['admin'] || normalized['admin'].role !== 'admin') {
            normalized['admin'] = { password: 'admin123', role: 'admin' }
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(normalized))
        return normalized
    } catch {
        const seed = seedDemoUsers()
        localStorage.setItem(USERS_KEY, JSON.stringify(seed))
        return seed
    }
}

export function saveUsers(users) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) } catch {}
    updateUsers(users) // sync to cloud (fire and forget)
}

const TABS = [
    { id: 'login', label: 'Login', icon: <MdPerson className='w-4 h-4' /> },
    { id: 'register', label: 'Register', icon: <MdPersonAdd className='w-4 h-4' /> },
    { id: 'admin', label: 'Admin', icon: <MdAdminPanelSettings className='w-4 h-4' /> },
]

function Login() {
    const { setUser, setCurrentPage } = useContext(dataContext)
    const [tab, setTab] = useState('login')
    const [users, setUsers] = useState(() => loadUsers())
    const [loading, setLoading] = useState(true)

    const [loginId, setLoginId] = useState('')
    const [loginPw, setLoginPw] = useState('')
    const [regId, setRegId] = useState('')
    const [regPw, setRegPw] = useState('')
    const [regPwConfirm, setRegPwConfirm] = useState('')
    const [adminId, setAdminId] = useState('')
    const [adminPw, setAdminPw] = useState('')

    // Load users from JSONBin on mount, sync to localStorage
    useEffect(() => {
        readDB().then(db => {
            if (db?.users) {
                const normalized = normalizeUsers(db.users)
                if (!normalized['admin'] || normalized['admin'].role !== 'admin') {
                    normalized['admin'] = { password: 'admin123', role: 'admin' }
                }
                setUsers(normalized)
                localStorage.setItem(USERS_KEY, JSON.stringify(normalized))
            }
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const switchTab = (t) => {
        setTab(t)
        setLoginId(''); setLoginPw('')
        setRegId(''); setRegPw(''); setRegPwConfirm('')
        setAdminId(''); setAdminPw('')
    }

    const handleLogin = (e) => {
        e.preventDefault()
        if (!loginId || !loginPw) { toast.error('Please enter UserID and password'); return }
        const u = users[loginId]
        if (!u || u.password !== loginPw) { toast.error('Invalid UserID or password'); return }
        if (u.role === 'admin') { toast.error('Use the Admin tab to login as admin'); return }
        setUser({ userId: loginId, role: 'user' })
        setCurrentPage('home')
        toast.success(`Welcome back, ${loginId}!`)
    }

    const handleRegister = (e) => {
        e.preventDefault()
        if (!regId || !regPw) { toast.error('Please fill all fields'); return }
        if (regPw !== regPwConfirm) { toast.error('Passwords do not match'); return }
        if (regPw.length < 4) { toast.error('Password must be at least 4 characters'); return }
        if (users[regId]) { toast.error('UserID already taken'); return }
        const next = { ...users, [regId]: { password: regPw, role: 'user' } }
        setUsers(next)
        saveUsers(next)
        setUser({ userId: regId, role: 'user' })
        setCurrentPage('home')
        toast.success('Account created — welcome!')
    }

    const handleAdminLogin = (e) => {
        e.preventDefault()
        if (!adminId || !adminPw) { toast.error('Please enter admin credentials'); return }
        const u = users[adminId]
        if (!u || u.password !== adminPw) { toast.error('Invalid admin credentials'); return }
        if (u.role !== 'admin') { toast.error('This account does not have admin privileges'); return }
        setUser({ userId: adminId, role: 'admin' })
        setCurrentPage('admin')
        toast.success(`Welcome, Admin ${adminId}!`)
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-200 dark:from-gray-900 dark:to-gray-800 p-4'>
            <div className='w-full max-w-md'>
                <div className='flex flex-col items-center mb-8'>
                    <div className='w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg mb-3'>
                        <MdFastfood className='w-9 h-9 text-white' />
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>FoodieHub</h1>
                    <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>Delicious food, delivered fast</p>
                    {loading && <p className='text-xs text-green-500 mt-1'>Syncing data...</p>}
                </div>

                <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
                    <div className='flex border-b border-gray-200 dark:border-gray-700'>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => switchTab(t.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                                    tab === t.id
                                        ? t.id === 'admin' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}>
                                {t.icon}{t.label}
                            </button>
                        ))}
                    </div>

                    <div className='p-6'>
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className='space-y-4'>
                                <h2 className='text-xl font-bold text-gray-800 dark:text-white text-center mb-2'>Welcome back</h2>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>UserID</label>
                                    <input value={loginId} onChange={e => setLoginId(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400'
                                        placeholder='Enter your UserID' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>Password</label>
                                    <input type='password' value={loginPw} onChange={e => setLoginPw(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400'
                                        placeholder='Enter your password' />
                                </div>
                                <button type='submit' className='w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors'>Sign In</button>
                                <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
                                    No account?{' '}
                                    <button type='button' onClick={() => switchTab('register')} className='text-green-600 font-semibold hover:underline'>Register here</button>
                                </p>
                            </form>
                        )}

                        {tab === 'register' && (
                            <form onSubmit={handleRegister} className='space-y-4'>
                                <h2 className='text-xl font-bold text-gray-800 dark:text-white text-center mb-2'>Create account</h2>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>UserID</label>
                                    <input value={regId} onChange={e => setRegId(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400'
                                        placeholder='Choose a UserID' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>Password</label>
                                    <input type='password' value={regPw} onChange={e => setRegPw(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400'
                                        placeholder='Choose a password' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>Confirm Password</label>
                                    <input type='password' value={regPwConfirm} onChange={e => setRegPwConfirm(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400'
                                        placeholder='Confirm your password' />
                                </div>
                                <button type='submit' className='w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors'>Create Account</button>
                                <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
                                    Already have an account?{' '}
                                    <button type='button' onClick={() => switchTab('login')} className='text-green-600 font-semibold hover:underline'>Sign in</button>
                                </p>
                            </form>
                        )}

                        {tab === 'admin' && (
                            <form onSubmit={handleAdminLogin} className='space-y-4'>
                                <div className='flex flex-col items-center mb-2'>
                                    <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2'>
                                        <MdAdminPanelSettings className='w-7 h-7 text-purple-600 dark:text-purple-300' />
                                    </div>
                                    <h2 className='text-xl font-bold text-gray-800 dark:text-white'>Admin Access</h2>
                                    <p className='text-xs text-gray-400 mt-1'>Restricted to authorized personnel only</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>Admin ID</label>
                                    <input value={adminId} onChange={e => setAdminId(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400'
                                        placeholder='Admin UserID' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>Admin Password</label>
                                    <input type='password' value={adminPw} onChange={e => setAdminPw(e.target.value)}
                                        className='w-full px-4 py-2.5 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400'
                                        placeholder='Admin password' />
                                </div>
                                <button type='submit' className='w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2'>
                                    <MdAdminPanelSettings className='w-5 h-5' />Access Admin Panel
                                </button>
                                <p className='text-center text-xs text-gray-400'>Default: admin / admin123</p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
