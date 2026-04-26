import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch } from 'react-redux';
import { DecrementQty, IncrementQty, RemoveItem } from '../redux/cartSlice';
function Card2({name,id,price,image,qty}) {
    let dispatch=useDispatch()
  return (
    <div className='w-full h-[120px] p-2 bg-white dark:bg-gray-700 shadow-lg flex justify-between rounded-lg'>
      <div className='w-[60%] h-full  flex gap-5'>
        <div className='w-[60%] h-full overflow-hidden rounded-lg'>
            <img src={image} alt="" className='object-cover'/>
        </div>
        <div className='w-[40%] h-full flex flex-col gap-3'>
            <div className='text-lg text-gray-600 dark:text-gray-300 font-semibold'>{name}</div>
            <div className='w-[110px] h-[50px] bg-slate-400 dark:bg-slate-500 flex rounded-lg overflow-hidden shadow-lg  font-semibold border-2 border-green-400 text-xl'>
                <button className='w-[30%] h-full bg-white dark:bg-gray-600 flex justify-center items-center text-green-400 hover:bg-gray-200 dark:hover:bg-gray-500' onClick={()=>{
                  if (qty > 1) dispatch(DecrementQty(id))
                }}>-</button>
                <span className='w-[40%] h-full bg-slate-200 dark:bg-slate-400 flex justify-center items-center text-green-400'>{qty}</span>
                <button className='w-[30%] h-full bg-white dark:bg-gray-600 flex justify-center items-center text-green-400 hover:bg-gray-200 dark:hover:bg-gray-500' onClick={()=>{
                  dispatch(IncrementQty(id))
                }}>+</button>
            </div>
        </div>
      </div>
      <div className=' flex flex-col justify-start items-end gap-6'>
<span className='text-xl text-green-400 font-semibold'>Rs {price}/-</span>
<RiDeleteBin6Line className='w-[30px] h-[30px] text-red-400 cursor-pointer' onClick={()=>dispatch(RemoveItem(id))}/>
      </div>
    </div>
  )
}

export default Card2
