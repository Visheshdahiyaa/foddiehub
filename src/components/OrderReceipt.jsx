import { MdClose, MdPrint, MdCheckCircle, MdDownload, MdLocationOn, MdPhone, MdPerson } from 'react-icons/md'
import { MdFastfood } from 'react-icons/md'

function OrderReceipt({ order, onClose }) {
    if (!order) return null

    const handlePrint = () => window.print()

    const handleDownload = () => {
        const lines = [
            '=============================',
            '         FOODIEHUB           ',
            '=============================',
            `Order ID : ${order.id}`,
            `Date     : ${new Date(order.placedAt).toLocaleString()}`,
            order.delivery ? `Deliver To: ${order.delivery.name}, ${order.delivery.address}` : '',
            '-----------------------------',
            'ITEMS',
            '-----------------------------',
            ...order.items.map(i => `${i.name.padEnd(20)} x${i.qty}  Rs ${i.price * i.qty}/-`),
            '-----------------------------',
            `Subtotal : Rs ${order.subtotal}/-`,
            `Delivery : Rs ${order.deliveryFee}/-`,
            `Taxes    : Rs ${order.taxes}/-`,
            order.discount > 0 ? `Discount : -Rs ${order.discount}/-` : '',
            '-----------------------------',
            `TOTAL    : Rs ${order.total}/-`,
            '=============================',
            '   Thank you for your order! ',
            '=============================',
        ].filter(Boolean).join('\n')

        const blob = new Blob([lines], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt_${order.id}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden print:shadow-none'>
                {/* Header */}
                <div className='bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center print:hidden'>
                    <div className='flex items-center gap-2'>
                        <MdCheckCircle className='w-6 h-6 text-white' />
                        <span className='text-white font-bold text-lg'>Order Receipt</span>
                    </div>
                    <button onClick={onClose}><MdClose className='w-6 h-6 text-white hover:opacity-70' /></button>
                </div>

                <div className='p-6'>
                    {/* Brand */}
                    <div className='flex flex-col items-center mb-4'>
                        <div className='w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-2'>
                            <MdFastfood className='w-7 h-7 text-white' />
                        </div>
                        <h2 className='text-xl font-bold text-gray-800 dark:text-white'>FoodieHub</h2>
                        <p className='text-xs text-gray-400'>123 Food Street, Sonipat, Haryana</p>
                    </div>

                    {/* Delivery Info */}
                    {order.delivery && (
                        <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-1'>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>Deliver To</p>
                            <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                                <MdPerson className='w-4 h-4 text-green-500 flex-shrink-0' />
                                <span>{order.delivery.name}</span>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                                <MdPhone className='w-4 h-4 text-green-500 flex-shrink-0' />
                                <span>{order.delivery.phone}</span>
                            </div>
                            <div className='flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300'>
                                <MdLocationOn className='w-4 h-4 text-green-500 flex-shrink-0 mt-0.5' />
                                <span>{order.delivery.address}</span>
                            </div>
                        </div>
                    )}

                    <div className='border-t border-dashed border-gray-300 dark:border-gray-600 my-3' />

                    {/* Order Info */}
                    <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3'>
                        <span>Order: <span className='font-mono text-gray-700 dark:text-gray-300'>{order.id.slice(-12)}</span></span>
                        <span>{new Date(order.placedAt).toLocaleString()}</span>
                    </div>

                    {/* Items */}
                    <div className='space-y-2 mb-3'>
                        {order.items.map((item, i) => (
                            <div key={i} className='flex justify-between text-sm'>
                                <span className='text-gray-700 dark:text-gray-300'>{item.name} <span className='text-gray-400'>x{item.qty}</span></span>
                                <span className='font-semibold text-gray-800 dark:text-white'>Rs {item.price * item.qty}/-</span>
                            </div>
                        ))}
                    </div>

                    <div className='border-t border-dashed border-gray-300 dark:border-gray-600 my-3' />

                    {/* Bill */}
                    <div className='space-y-1 text-sm'>
                        <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                            <span>Subtotal</span><span>Rs {order.subtotal}/-</span>
                        </div>
                        <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                            <span>Delivery</span><span>Rs {order.deliveryFee}/-</span>
                        </div>
                        <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                            <span>Taxes</span><span>Rs {order.taxes}/-</span>
                        </div>
                        {order.discount > 0 && (
                            <div className='flex justify-between text-green-600 dark:text-green-400'>
                                <span>Discount</span><span>- Rs {order.discount}/-</span>
                            </div>
                        )}
                    </div>

                    <div className='border-t border-dashed border-gray-300 dark:border-gray-600 my-3' />

                    <div className='flex justify-between text-lg font-bold text-gray-800 dark:text-white'>
                        <span>Total</span><span className='text-green-600 dark:text-green-400'>Rs {order.total}/-</span>
                    </div>

                    <div className='border-t border-dashed border-gray-300 dark:border-gray-600 my-3' />

                    <p className='text-center text-xs text-gray-400'>Thank you for ordering with FoodieHub! 🍽️</p>

                    {/* Actions */}
                    <div className='flex gap-2 mt-4 print:hidden'>
                        <button
                            onClick={handlePrint}
                            className='flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold'
                        >
                            <MdPrint className='w-4 h-4' />Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className='flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold'
                        >
                            <MdDownload className='w-4 h-4' />Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderReceipt
