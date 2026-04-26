import { useContext } from 'react'
import { LuLeafyGreen } from 'react-icons/lu'
import { GiChickenOven } from 'react-icons/gi'
import { AiFillHeart, AiOutlineHeart, AiFillStar } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { AddItem } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import { dataContext } from '../context/UserContext'

function Card({ name, image, id, price, type, item }) {
    const dispatch = useDispatch()
    const { favorites, toggleFavorite, ratings, setSelectedItem } = useContext(dataContext)
    const isFavorite = favorites.includes(id)
    const itemRating = ratings[id]
    const avgRating = itemRating && itemRating.count > 0
        ? (itemRating.total / itemRating.count).toFixed(1)
        : null

    return (
        <div
            className='w-[300px] h-[420px] bg-white dark:bg-gray-800 p-3 rounded-lg flex flex-col gap-3 shadow-lg hover:border-2 border-green-300 dark:border-green-600 transition-colors relative cursor-pointer'
            onClick={() => setSelectedItem(item)}
        >
            <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(id) }}
                className='absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10'
            >
                {isFavorite
                    ? <AiFillHeart className='w-5 h-5 text-red-500' />
                    : <AiOutlineHeart className='w-5 h-5 text-gray-400' />}
            </button>

            <div className='w-full h-[55%] overflow-hidden rounded-lg'>
                <img src={image} alt={name} className='w-full h-full object-cover' />
            </div>

            <div className='text-xl font-semibold text-gray-800 dark:text-white truncate'>{name}</div>

            <div className='flex items-center gap-1'>
                {avgRating
                    ? <>
                        <AiFillStar className='w-4 h-4 text-yellow-400' />
                        <span className='text-sm font-semibold text-gray-600 dark:text-gray-300'>{avgRating}</span>
                        <span className='text-xs text-gray-400'>({itemRating.count})</span>
                      </>
                    : <span className='text-xs text-gray-400'>No ratings yet</span>}
            </div>

            <div className='w-full flex justify-between items-center'>
                <div className='text-lg font-bold text-green-500'>Rs {price}/-</div>
                <div className='flex justify-center items-center gap-2 text-green-500 text-sm font-semibold'>
                    {type === 'veg' ? <LuLeafyGreen /> : <GiChickenOven />}
                    <span>{type}</span>
                </div>
            </div>

            <button
                className='w-full p-3 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-all'
                onClick={(e) => {
                    e.stopPropagation()
                    dispatch(AddItem({ id, name, price, image, qty: 1 }))
                    toast.success('Item added')
                }}
            >
                Add to Cart
            </button>
        </div>
    )
}

export default Card
