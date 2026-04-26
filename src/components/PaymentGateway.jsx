import { useState, useContext } from 'react'
import { MdCreditCard, MdClose, MdLock, MdCheckCircle, MdLocationOn, MdArrowBack } from 'react-icons/md'
import { SiGooglepay, SiPhonepe, SiPaytm } from 'react-icons/si'
import { FaMoneyBillWave } from 'react-icons/fa'
import { dataContext } from '../context/UserContext'

const METHODS = [
    { id: 'card', label: 'Credit / Debit Card', icon: <MdCreditCard className='w-5 h-5' /> },
    { id: 'upi', label: 'UPI', icon: <SiGooglepay className='w-5 h-5' /> },
    { id: 'cod', label: 'Cash on Delivery', icon: <FaMoneyBillWave className='w-5 h-5' /> },
]

function PaymentGateway({ total, onPaymentSuccess, onCancel }) {
    const { profiles } = useContext(dataContext)
    const [step, setStep] = useState('address') // 'address' | 'payment' | 'processing' | 'success'
    const [method, setMethod] = useState('card')

    // Address fields — prefill from active profile if available
    const savedAddress = profiles?.[0]?.address || ''
    const savedName = profiles?.[0]?.name || ''
    const savedPhone = profiles?.[0]?.phone || ''
    const [deliveryName, setDeliveryName] = useState(savedName)
    const [deliveryPhone, setDeliveryPhone] = useState(savedPhone)
    const [deliveryAddress, setDeliveryAddress] = useState(savedAddress)

    // Card fields
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardName, setCardName] = useState('')

    // UPI
    const [upiId, setUpiId] = useState('')
    const [upiApp, setUpiApp] = useState('gpay')

    const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
    const formatExpiry = (val) => {
        const d = val.replace(/\D/g, '').slice(0, 4)
        return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
    }

    const validateAddress = () => {
        if (!deliveryName.trim()) return 'Enter recipient name'
        if (!deliveryPhone.trim()) return 'Enter phone number'
        if (!deliveryAddress.trim()) return 'Enter delivery address'
        return null
    }

    const validatePayment = () => {
        if (method === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 16) return 'Enter a valid 16-digit card number'
            if (expiry.length < 5) return 'Enter a valid expiry date'
            if (cvv.length < 3) return 'Enter a valid CVV'
            if (!cardName.trim()) return 'Enter cardholder name'
        }
        if (method === 'upi') {
            if (!upiId.includes('@')) return 'Enter a valid UPI ID (e.g. name@upi)'
        }
        return null
    }

    const handleAddressNext = () => {
        const err = validateAddress()
        if (err) { alert(err); return }
        setStep('payment')
    }

    const handlePay = () => {
        const err = validatePayment()
        if (err) { alert(err); return }
        setStep('processing')
        setTimeout(() => setStep('success'), 2000)
        setTimeout(() => onPaymentSuccess({
            name: deliveryName,
            phone: deliveryPhone,
            address: deliveryAddress,
            method: METHODS.find(m => m.id === method)?.label
        }), 3200)
    }

    if (step === 'processing') return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl'>
                <div className='w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin' />
                <p className='text-lg font-semibold text-gray-700 dark:text-white'>Processing Payment...</p>
                <p className='text-sm text-gray-400'>Please do not close this window</p>
            </div>
        </div>
    )

    if (step === 'success') return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl'>
                <MdCheckCircle className='w-20 h-20 text-green-500' />
                <p className='text-2xl font-bold text-gray-800 dark:text-white'>Payment Successful!</p>
                <p className='text-gray-500 dark:text-gray-400'>Rs {total}/- paid via {METHODS.find(m => m.id === method)?.label}</p>
                <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    <MdLocationOn className='w-4 h-4 text-green-500' />
                    <span>{deliveryAddress}</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden'>
                {/* Header */}
                <div className='bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                        {step === 'payment' && (
                            <button onClick={() => setStep('address')} className='text-white hover:opacity-70'>
                                <MdArrowBack className='w-5 h-5' />
                            </button>
                        )}
                        <div>
                            <h2 className='text-xl font-bold text-white'>
                                {step === 'address' ? 'Delivery Address' : 'Secure Payment'}
                            </h2>
                            <p className='text-green-100 text-xs'>
                                Step {step === 'address' ? '1' : '2'} of 2 — {step === 'address' ? 'Where to deliver?' : 'How to pay?'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className='text-white hover:opacity-70'><MdClose className='w-6 h-6' /></button>
                </div>

                <div className='p-6 space-y-4 max-h-[75vh] overflow-y-auto'>
                    {/* Step 1 — Address */}
                    {step === 'address' && (
                        <>
                            <div className='bg-green-50 dark:bg-green-900/30 rounded-xl px-4 py-3 flex justify-between items-center'>
                                <span className='text-gray-600 dark:text-gray-300 font-medium'>Order Total</span>
                                <span className='text-2xl font-bold text-green-600 dark:text-green-400'>Rs {total}/-</span>
                            </div>

                            {[
                                { label: 'Recipient Name', value: deliveryName, set: setDeliveryName, type: 'text', placeholder: 'Full name' },
                                { label: 'Phone Number', value: deliveryPhone, set: setDeliveryPhone, type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                            ].map(({ label, value, set, type, placeholder }) => (
                                <div key={label}>
                                    <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>{label}</label>
                                    <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                                        className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400' />
                                </div>
                            ))}

                            <div>
                                <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Delivery Address</label>
                                <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                                    placeholder='House/Flat No., Street, Area, City, Pincode'
                                    rows={3}
                                    className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 resize-none' />
                            </div>

                            <button onClick={handleAddressNext}
                                className='w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg'>
                                <MdLocationOn className='w-5 h-5' />Continue to Payment
                            </button>
                        </>
                    )}

                    {/* Step 2 — Payment */}
                    {step === 'payment' && (
                        <>
                            {/* Delivery summary */}
                            <div className='bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex items-start gap-2'>
                                <MdLocationOn className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                                <div className='text-sm'>
                                    <p className='font-semibold text-gray-800 dark:text-white'>{deliveryName} · {deliveryPhone}</p>
                                    <p className='text-gray-500 dark:text-gray-400'>{deliveryAddress}</p>
                                </div>
                            </div>

                            <div className='bg-green-50 dark:bg-green-900/30 rounded-xl px-4 py-3 flex justify-between items-center'>
                                <span className='text-gray-600 dark:text-gray-300 font-medium'>Amount to Pay</span>
                                <span className='text-2xl font-bold text-green-600 dark:text-green-400'>Rs {total}/-</span>
                            </div>

                            <div className='flex flex-col gap-2'>
                                {METHODS.map(m => (
                                    <button key={m.id} onClick={() => setMethod(m.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${method === m.id ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
                                        <span className={method === m.id ? 'text-green-600' : 'text-gray-500'}>{m.icon}</span>
                                        <span className={`font-medium ${method === m.id ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
                                        {method === m.id && <span className='ml-auto w-3 h-3 rounded-full bg-green-500' />}
                                    </button>
                                ))}
                            </div>

                            {method === 'card' && (
                                <div className='space-y-3'>
                                    <div>
                                        <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Card Number</label>
                                        <input type='text' placeholder='1234 5678 9012 3456' value={cardNumber}
                                            onChange={e => setCardNumber(formatCard(e.target.value))}
                                            className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400' />
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='flex-1'>
                                            <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Expiry</label>
                                            <input type='text' placeholder='MM/YY' value={expiry}
                                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                                                className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400' />
                                        </div>
                                        <div className='flex-1'>
                                            <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>CVV</label>
                                            <input type='password' placeholder='•••' maxLength={4} value={cvv}
                                                onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                                                className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400' />
                                        </div>
                                    </div>
                                    <div>
                                        <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Cardholder Name</label>
                                        <input type='text' placeholder='Name on card' value={cardName}
                                            onChange={e => setCardName(e.target.value)}
                                            className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400' />
                                    </div>
                                </div>
                            )}

                            {method === 'upi' && (
                                <div className='space-y-3'>
                                    <div className='flex gap-3'>
                                        {[
                                            { id: 'gpay', icon: <SiGooglepay className='w-7 h-7' />, label: 'GPay' },
                                            { id: 'phonepe', icon: <SiPhonepe className='w-7 h-7' />, label: 'PhonePe' },
                                            { id: 'paytm', icon: <SiPaytm className='w-7 h-7' />, label: 'Paytm' },
                                        ].map(app => (
                                            <button key={app.id} onClick={() => setUpiApp(app.id)}
                                                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${upiApp === app.id ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>
                                                {app.icon}
                                                <span className='text-xs font-semibold'>{app.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div>
                                        <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>UPI ID</label>
                                        <input type='text' placeholder='yourname@upi' value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                            className='w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400' />
                                    </div>
                                </div>
                            )}

                            {method === 'cod' && (
                                <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300'>
                                    💵 Pay <span className='font-bold'>Rs {total}/-</span> in cash when your order arrives at <span className='font-semibold'>{deliveryAddress}</span>.
                                </div>
                            )}

                            <button onClick={handlePay}
                                className='w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg'>
                                <MdLock className='w-5 h-5' />
                                {method === 'cod' ? 'Confirm Order' : `Pay Rs ${total}/-`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentGateway
