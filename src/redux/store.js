import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cartSlice"

function loadCart() {
  try {
    const raw = localStorage.getItem('cart_v1')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export const store = configureStore({
  reducer: { cart: cartSlice },
  preloadedState: { cart: loadCart() }
})

store.subscribe(() => {
  try {
    localStorage.setItem('cart_v1', JSON.stringify(store.getState().cart))
  } catch {}
})