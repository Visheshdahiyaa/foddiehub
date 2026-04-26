import { useContext, useState } from 'react'
import { dataContext } from '../context/UserContext'
import { MdCheckCircle, MdRadioButtonUnchecked, MdLocationOn } from 'react-icons/md'
import DeliveryMap from './DeliveryMap'

const STEPS = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered']

function OrderStatus({ orderId }) {
    const { orderStatuses, setOrderStatuses } = useContext(dataContext)
    const step = orderStatuses[orderId] ?? 0
    const [showMap, setShowMap] = useState(false)

    const advance = () => {
        if (step < STEPS.length - 1) {
            setOrderStatuses(prev => ({ ...prev, [orderId]: step + 1 }))
        }
    }

    return (
        <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
            <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>Order Status</span>
                <div className='flex gap-2'>
                    {step > 0 && step < STEPS.length - 1 && (
                        <button
                            onClick={() => setShowMap(true)}
                            className='text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1'
                        >
                            <MdLocationOn className='w-3 h-3' /> Track
                        </button>
                    )}
                    {step < STEPS.length - 1 && (
                        <button
                            onClick={advance}
                            className='text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
                        >
                            Advance
                        </button>
                    )}
                </div>
            </div>
            <div className='flex items-center gap-1'>
                {STEPS.map((label, i) => (
                    <div key={label} className='flex items-center flex-1 last:flex-none'>
                        <div className='flex flex-col items-center'>
                            {i <= step
                                ? <MdCheckCircle className='w-5 h-5 text-green-500' />
                                : <MdRadioButtonUnchecked className='w-5 h-5 text-gray-300 dark:text-gray-600' />}
                            <span className={`text-[9px] text-center mt-0.5 leading-tight ${i <= step ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-3 ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Delivery Map Modal */}
            {showMap && (
                <DeliveryMap 
                    orderId={orderId} 
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    )
}

export default OrderStatus
