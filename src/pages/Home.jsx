import { useContext, useState, useEffect } from 'react'
import Nav from '../components/Nav'
import Categories from '../Category'
import Card from '../components/Card'
import Footer from '../components/Footer'
import ItemModal from '../components/ItemModal'
import PaymentGateway from '../components/PaymentGateway'
import OrderReceipt from '../components/OrderReceipt'
import OrderStatus from '../components/OrderStatus'
import { dataContext } from '../context/UserContext'
import { RxCross2 } from 'react-icons/rx'
import { MdCheckCircle } from 'react-icons/md'
import { MdLocationOn } from 'react-icons/md'
import Card2 from '../components/Card2'
import { useSelector, useDispatch } from 'react-redux'
import { AddItem, ClearCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import { readDB, updateOrders } from '../services/db'

const COUPONS = { SAVE10: 10, FLAT50: 50, FOODIE20: 20 }
const PAGE_SIZE = 8
const ORDER_RATINGS_KEY = 'order_ratings_v1'

function EmptyCartSVG() {
    return (
        <div className='flex flex-col items-center py-10 gap-3'>
            <svg width='100' height='100' viewBox='0 0 100 100' fill='none'>
                <circle cx='50' cy='50' r='48' stroke='#d1fae5' strokeWidth='4' />
                <path d='M30 40h40l-5 20H35L30 40z' stroke='#22c55e' strokeWidth='2.5' fill='#f0fdf4' strokeLinejoin='round' />
                <circle cx='40' cy='64' r='3' fill='#22c55e' />
                <circle cx='60' cy='64' r='3' fill='#22c55e' />
                <path d='M25 35h5l5 25' stroke='#22c55e' strokeWidth='2.5' strokeLinecap='round' />
            </svg>
            <p className='text-xl font-semibold text-gray-400'>Your cart is empty</p>
        </div>
    )
}

function EmptyOrdersSVG() {
    return (
        <div className='flex flex-col items-center py-10 gap-3'>
            <svg width='100' height='100' viewBox='0 0 100 100' fill='none'>
                <circle cx='50' cy='50' r='48' stroke='#d1fae5' strokeWidth='4' />
                <rect x='28' y='30' width='44' height='40' rx='4' stroke='#22c55e' strokeWidth='2.5' fill='#f0fdf4' />
                <path d='M36 44h28M36 52h20' stroke='#22c55e' strokeWidth='2.5' strokeLinecap='round' />
            </svg>
            <p className='text-xl font-semibold text-gray-400'>No recent orders</p>
        </div>
    )
}

function Home() {
    const { cate, setCate, input, showCart, setShowCart, setCurrentPage, allItems, selectedItem, addNotification } = useContext(dataContext)
    const [showPlaced, setShowPlaced] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [lastOrder, setLastOrder] = useState(null)
    const [showReceipt, setShowReceipt] = useState(false)
    const [sideView, setSideView] = useState('cart')
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [coupon, setCoupon] = useState('')
    const [discount, setDiscount] = useState(0)
    const [couponApplied, setCouponApplied] = useState('')
    const [page, setPage] = useState(1)
    const [orderRatings, setOrderRatings] = useState(() => {
        try { return JSON.parse(localStorage.getItem(ORDER_RATINGS_KEY) || '{}') } catch { return {} }
    })
    const [ratingTarget, setRatingTarget] = useState(null)
    const [hoverRating, setHoverRating] = useState(0)

    const items = useSelector(state => state.cart)
    const dispatch = useDispatch()

    useEffect(() => {
        let t
        if (showPlaced) t = setTimeout(() => setShowPlaced(false), 3000)
        return () => clearTimeout(t)
    }, [showPlaced])

    useEffect(() => { setCurrentPage('home') }, [setCurrentPage])
    useEffect(() => { setPage(1) }, [cate])

    function filter(category) {
        if (category === 'All') setCate(allItems)
        else setCate(allItems.filter(item => item.food_category === category))
    }

    const subtotal = items.reduce((total, item) => total + item.qty * item.price, 0)
    const deliveryFee = 20
    const taxes = Math.round(subtotal * 0.5 / 100)
    const discountAmt = couponApplied ? Math.round(subtotal * (discount / 100)) : 0
    const total = Math.floor(subtotal + deliveryFee + taxes - discountAmt)

    const applyCoupon = () => {
        const code = coupon.trim().toUpperCase()
        if (COUPONS[code]) {
            setDiscount(COUPONS[code]); setCouponApplied(code)
            toast.success(`Coupon applied! ${COUPONS[code]}% off`)
        } else { toast.error('Invalid coupon code') }
    }

    const removeCoupon = () => { setDiscount(0); setCouponApplied(''); setCoupon('') }

    const handlePlaceOrder = () => {
        if (!items || items.length === 0) { toast.error('Cart is empty'); return }
        setShowPayment(true)
    }

    const handlePaymentSuccess = async (deliveryInfo) => {
        const order = {
            id: `order_${Date.now()}`,
            items, subtotal, deliveryFee, taxes,
            discount: discountAmt, total,
            delivery: deliveryInfo,
            placedAt: new Date().toISOString()
        }
        try {
            const raw = localStorage.getItem('order_history_v1')
            const arr = raw ? JSON.parse(raw) : []
            arr.push(order)
            localStorage.setItem('order_history_v1', JSON.stringify(arr))
            updateOrders(arr)
        } catch {}
        dispatch(ClearCart())
        removeCoupon()
        setShowCart(false)
        setShowPayment(false)
        setLastOrder(order)
        setShowPlaced(true)
        addNotification(`Order placed! Rs ${order.total}/- · ${order.items.length} item(s)`, 'success')
    }

    const handleReorder = (ord) => {
        ord.items.forEach(item => dispatch(AddItem({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 })))
        setSideView('cart')
        toast.success(`${ord.items.length} item(s) added to cart`)
        addNotification(`Reordered ${ord.items.length} item(s)`, 'info')
    }

    const handleOrderRating = (ordId, stars) => {
        const updated = { ...orderRatings, [ordId]: stars }
        setOrderRatings(updated)
        try { localStorage.setItem(ORDER_RATINGS_KEY, JSON.stringify(updated)) } catch {}
        setRatingTarget(null)
        toast.success('Thanks for your feedback!')
        addNotification('Order rated — thank you!', 'success')
    }

    const fetchOrders = async () => {
        setLoadingOrders(true)
        try {
            const db = await readDB()
            if (db?.orders) {
                setOrders(db.orders)
                localStorage.setItem('order_history_v1', JSON.stringify(db.orders))
            } else {
                const raw = localStorage.getItem('order_history_v1')
                setOrders(raw ? JSON.parse(raw) : [])
            }
        } catch {
            const raw = localStorage.getItem('order_history_v1')
            setOrders(raw ? JSON.parse(raw) : [])
        } finally { setLoadingOrders(false) }
    }

    const clearOrders = async () => {
        try { localStorage.removeItem('order_history_v1') } catch {}
        updateOrders([])
        setOrders([])
        toast.success('Order history cleared')
    }

    const totalPages = Math.ceil(cate.length / PAGE_SIZE)
    const paginated = cate.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className='bg-white dark:bg-gray-900 w-full min-h-screen transition-colors'>
            <Nav />
            <h1 className='text-4xl font-bold text-center text-green-600 dark:text-green-400 py-6'>Food Delivery Service</h1>

            {!input && (
                <div className='flex flex-wrap justify-center items-center gap-5 w-full px-5'>
                    {Categories.map((item) => (
                        <div key={item.name}
                            className='w-[140px] h-[150px] bg-white dark:bg-gray-800 flex flex-col items-start gap-5 p-5 justify-start text-[20px] font-semibold text-gray-600 dark:text-gray-300 rounded-lg shadow-xl hover:bg-green-200 dark:hover:bg-green-800 transition-all duration-200 cursor-pointer'
                            onClick={() => filter(item.name)}>
                            {item.icon}{item.name}
                        </div>
                    ))}
                </div>
            )}

            <div className='w-full flex flex-wrap gap-5 px-5 justify-center items-center pt-8 pb-4'>
                {paginated.length > 0
                    ? paginated.map(item => (
                        <Card key={item.id} name={item.food_name} image={item.food_image}
                            price={item.price} id={item.id} type={item.food_type} item={item} />
                    ))
                    : (
                        <div className='flex flex-col items-center py-10 gap-3'>
                            <svg width='80' height='80' viewBox='0 0 100 100' fill='none'>
                                <circle cx='50' cy='50' r='48' stroke='#d1fae5' strokeWidth='4' />
                                <path d='M35 35l30 30M65 35L35 65' stroke='#22c55e' strokeWidth='3' strokeLinecap='round' />
                            </svg>
                            <p className='text-2xl text-green-500 font-semibold'>No dishes found</p>
                        </div>
                    )}
            </div>

            {totalPages > 1 && (
                <div className='flex justify-center items-center gap-2 pb-8'>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className='px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-green-50 transition-colors'>
                        ‹ Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded-lg font-semibold transition-colors ${page === p ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-green-50'}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className='px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-green-50 transition-colors'>
                        Next ›
                    </button>
                </div>
            )}

            {/* Cart Sidebar */}
            <div className={`w-full md:w-[40vw] h-full fixed top-0 right-0 bg-white dark:bg-gray-800 shadow-xl p-6 transition-all duration-500 flex flex-col items-center overflow-auto z-40 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
                <header className='w-full flex justify-between items-center mb-4'>
                    <div className='flex items-center gap-2 flex-wrap'>
                        <button onClick={() => setSideView('cart')} className={`px-3 py-1 rounded text-sm font-semibold ${sideView === 'cart' ? 'bg-green-400 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Order Items</button>
                        <button onClick={() => { setSideView('orders'); fetchOrders() }} className={`px-3 py-1 rounded text-sm font-semibold ${sideView === 'orders' ? 'bg-green-400 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Recent Orders</button>
                        {sideView === 'orders' && (
                            <button onClick={clearOrders} className='px-3 py-1 rounded bg-red-500 text-white text-sm font-semibold'>Clear</button>
                        )}
                    </div>
                    <RxCross2 className='w-7 h-7 text-green-400 cursor-pointer hover:text-gray-600' onClick={() => setShowCart(false)} />
                </header>

                {sideView === 'cart' ? (
                    items.length > 0 ? (
                        <>
                            <div className='w-full flex flex-col gap-6'>
                                {items.map(item => (
                                    <Card2 key={item.id} name={item.name} price={item.price} image={item.image} id={item.id} qty={item.qty} />
                                ))}
                            </div>

                            <div className='w-full mt-6'>
                                {couponApplied ? (
                                    <div className='flex items-center justify-between bg-green-50 dark:bg-green-900 border border-green-300 rounded-lg px-3 py-2'>
                                        <span className='text-sm font-semibold text-green-700 dark:text-green-300'>{couponApplied} — {discount}% off applied</span>
                                        <button onClick={removeCoupon} className='text-xs text-red-500 hover:underline'>Remove</button>
                                    </div>
                                ) : (
                                    <div className='flex gap-2'>
                                        <input type='text' placeholder='Coupon code' value={coupon}
                                            onChange={e => setCoupon(e.target.value)}
                                            className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white' />
                                        <button onClick={applyCoupon} className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-400 transition-colors'>Apply</button>
                                    </div>
                                )}
                            </div>

                            <div className='w-full border-t-2 border-b-2 border-gray-200 dark:border-gray-600 mt-4 flex flex-col gap-2 py-4'>
                                <div className='flex justify-between text-gray-600 dark:text-gray-300'><span>Subtotal</span><span className='text-green-500 font-semibold'>Rs {subtotal}/-</span></div>
                                <div className='flex justify-between text-gray-600 dark:text-gray-300'><span>Delivery Fee</span><span className='text-green-500 font-semibold'>Rs {deliveryFee}/-</span></div>
                                <div className='flex justify-between text-gray-600 dark:text-gray-300'><span>Taxes</span><span className='text-green-500 font-semibold'>Rs {taxes}/-</span></div>
                                {discountAmt > 0 && (
                                    <div className='flex justify-between text-green-600 dark:text-green-400'>
                                        <span>Discount ({discount}%)</span><span className='font-semibold'>- Rs {discountAmt}/-</span>
                                    </div>
                                )}
                            </div>
                            <div className='w-full flex justify-between items-center py-4'>
                                <span className='text-xl text-gray-700 dark:text-white font-bold'>Total</span>
                                <span className='text-green-500 font-bold text-xl'>Rs {total}/-</span>
                            </div>
                            <button className='w-[80%] p-3 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-all font-semibold' onClick={handlePlaceOrder}>
                                Place Order
                            </button>
                        </>
                    ) : <EmptyCartSVG />
                ) : (
                    <div className='w-full mt-4'>
                        {loadingOrders ? (
                            <div className='text-center py-8 text-gray-500'>Loading orders...</div>
                        ) : orders.length > 0 ? (
                            <div className='flex flex-col gap-4'>
                                {orders.slice().reverse().map(ord => (
                                    <div key={ord.id} className='w-full p-4 bg-slate-100 dark:bg-gray-700 rounded-lg'>
                                        <div className='flex justify-between items-center'>
                                            <div>
                                                <div className='font-semibold text-gray-800 dark:text-white text-sm'>Order: {ord.id.slice(-10)}</div>
                                                <div className='text-xs text-gray-500'>{new Date(ord.placedAt).toLocaleString()}</div>
                                                {ord.delivery?.address && (
                                                    <div className='text-xs text-gray-400 mt-0.5 flex items-center gap-1'><MdLocationOn className='w-3 h-3' />{ord.delivery.address}</div>
                                                )}
                                            </div>
                                            <div className='text-right'>
                                                <div className='font-semibold text-green-500'>Rs {ord.total}/-</div>
                                                <div className='text-xs text-gray-500'>{ord.items?.length || 0} items</div>
                                            </div>
                                        </div>

                                        <div className='mt-2 flex justify-end gap-2'>
                                            <button onClick={() => handleReorder(ord)}
                                                className='px-3 py-1 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition-colors'>
                                                Reorder
                                            </button>
                                            <button onClick={() => setExpandedOrder(expandedOrder === ord.id ? null : ord.id)}
                                                className='px-3 py-1 bg-white dark:bg-gray-600 border rounded text-sm'>
                                                {expandedOrder === ord.id ? 'Hide' : 'View'}
                                            </button>
                                        </div>

                                        {expandedOrder === ord.id && (
                                            <div className='mt-2 border-t pt-2'>
                                                {ord.items?.map((it, idx) => (
                                                    <div key={idx} className='flex justify-between text-sm py-1 text-gray-700 dark:text-gray-300'>
                                                        <span>{it.name}</span>
                                                        <span className='text-green-500'>Rs {it.price}/- x {it.qty}</span>
                                                    </div>
                                                ))}
                                                {ord.discount > 0 && (
                                                    <div className='flex justify-between text-sm text-green-600 pt-1'>
                                                        <span>Discount</span><span>- Rs {ord.discount}/-</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <OrderStatus orderId={ord.id} />

                                        {/* Order Rating */}
                                        <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
                                            {orderRatings[ord.id] ? (
                                                <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400'>
                                                    <span>Your rating:</span>
                                                    {[1,2,3,4,5].map(s => (
                                                        <span key={s} className={s <= orderRatings[ord.id] ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                    ))}
                                                </div>
                                            ) : ratingTarget === ord.id ? (
                                                <div className='flex items-center gap-1'>
                                                    <span className='text-xs text-gray-500 dark:text-gray-400 mr-1'>Rate:</span>
                                                    {[1,2,3,4,5].map(s => (
                                                        <button key={s}
                                                            onMouseEnter={() => setHoverRating(s)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => handleOrderRating(ord.id, s)}
                                                            className={`text-xl ${s <= hoverRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                            ★
                                                        </button>
                                                    ))}
                                                    <button onClick={() => setRatingTarget(null)} className='text-xs text-gray-400 ml-1'>Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setRatingTarget(ord.id)}
                                                    className='text-xs text-yellow-500 hover:text-yellow-600 font-semibold'>
                                                    Rate this order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyOrdersSVG />}
                    </div>
                )}
            </div>

            {showPlaced && (
                <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    <div className='absolute inset-0 bg-black opacity-50' />
                    <div className='relative bg-white dark:bg-gray-800 rounded-lg p-8 w-[90%] max-w-sm mx-auto flex flex-col items-center shadow-xl'>
                        <MdCheckCircle className='text-green-500 w-20 h-20 mb-4' />
                        <h3 className='text-2xl font-semibold mb-2 text-gray-800 dark:text-white'>Order Placed!</h3>
                        <p className='text-center text-gray-600 dark:text-gray-400 mb-4'>Your order has been placed successfully.</p>
                        <div className='flex gap-3'>
                            <button className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded' onClick={() => setShowPlaced(false)}>Close</button>
                            <button className='px-4 py-2 bg-green-500 text-white rounded' onClick={() => { setShowPlaced(false); setShowReceipt(true) }}>View Receipt</button>
                        </div>
                    </div>
                </div>
            )}

            {showPayment && (
                <PaymentGateway total={total} onPaymentSuccess={handlePaymentSuccess} onCancel={() => setShowPayment(false)} />
            )}

            {showReceipt && lastOrder && (
                <OrderReceipt order={lastOrder} onClose={() => setShowReceipt(false)} />
            )}

            {selectedItem && <ItemModal />}

            <Footer />
        </div>
    )
}

export default Home
