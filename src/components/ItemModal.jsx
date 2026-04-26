import { useContext, useState } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { LuLeafyGreen } from 'react-icons/lu'
import { GiChickenOven } from 'react-icons/gi'
import { AiFillHeart, AiOutlineHeart, AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { AddItem } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import { dataContext } from '../context/UserContext'

function ItemModal() {
    const { selectedItem, setSelectedItem, favorites, toggleFavorite, ratings, rateItem } = useContext(dataContext)
    const dispatch = useDispatch()
    const [hovered, setHovered] = useState(0)

    if (!selectedItem) return null

    const isFavorite = favorites.includes(selectedItem.id)
    const itemRating = ratings[selectedItem.id]
    const avgRating = itemRating && itemRating.count > 0
        ? (itemRating.total / itemRating.count).toFixed(1)
        : null

    const handleAdd = () => {
        dispatch(AddItem({ id: selectedItem.id, name: selectedItem.food_name, price: selectedItem.price, image: selectedItem.food_image, qty: 1 }))
        toast.success('Item added to cart')
        setSelectedItem(null)
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='absolute inset-0 bg-black opacity-60' onClick={() => setSelectedItem(null)} />
            <div className='relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90%] max-w-md mx-auto overflow-hidden'>
                <button
                    onClick={() => setSelectedItem(null)}
                    className='absolute top-3 right-3 z-10 bg-white dark:bg-gray-700 rounded-full p-1 shadow'
                >
                    <RxCross2 className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                </button>

                <div className='w-full h-56 overflow-hidden'>
                    <img src={selectedItem.food_image} alt={selectedItem.food_name} className='w-full h-full object-cover' />
                </div>

                <div className='p-5 flex flex-col gap-3'>
                    <div className='flex justify-between items-start'>
                        <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>{selectedItem.food_name}</h2>
                        <button onClick={() => toggleFavorite(selectedItem.id)}>
                            {isFavorite
                                ? <AiFillHeart className='w-6 h-6 text-red-500' />
                                : <AiOutlineHeart className='w-6 h-6 text-gray-400' />}
                        </button>
                    </div>

                    <div className='flex items-center gap-3'>
                        <span className='text-xl font-bold text-green-500'>Rs {selectedItem.price}/-</span>
                        <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
                            {selectedItem.food_type === 'veg' ? <LuLeafyGreen /> : <GiChickenOven />}
                            {selectedItem.food_type === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span className='text-sm text-gray-500 dark:text-gray-400 capitalize'>{selectedItem.food_category.replace('_', ' ')}</span>
                    </div>

                    {/* Star Rating */}
                    <div>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                            Rate this dish {avgRating ? <span className='font-semibold text-yellow-500'>· {avgRating} ★ ({itemRating.count})</span> : ''}
                        </p>
                        <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    onClick={() => { rateItem(selectedItem.id, star); toast.success('Rating saved!') }}
                                >
                                    {star <= hovered
                                        ? <AiFillStar className='w-6 h-6 text-yellow-400' />
                                        : <AiOutlineStar className='w-6 h-6 text-gray-400' />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className='w-full p-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-400 transition-all mt-1'
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ItemModal
