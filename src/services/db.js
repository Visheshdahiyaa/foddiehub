const BIN_ID = '69ee52d436566621a8f3ea3d'
const API_KEY = '$2a$10$56WRy2KByTQuXuvRM9CAwePMqbkhovqA0BhNjkouKsDCU41hH6E8y'
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`

const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
    'X-Bin-Versioning': 'false'
}

export async function readDB() {
    try {
        const res = await fetch(`${BASE_URL}/latest`, { headers })
        if (!res.ok) throw new Error()
        const json = await res.json()
        return json.record
    } catch {
        return null
    }
}

export async function writeDB(data) {
    try {
        const res = await fetch(BASE_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        })
        return res.ok
    } catch {
        return false
    }
}

export async function updateUsers(users) {
    const db = await readDB()
    if (!db) return false
    return writeDB({ ...db, users })
}

export async function updateOrders(orders) {
    const db = await readDB()
    if (!db) return false
    return writeDB({ ...db, orders })
}

export async function updateFavorites(userId, favorites) {
    const db = await readDB()
    if (!db) return false
    return writeDB({ ...db, favorites: { ...(db.favorites || {}), [userId]: favorites } })
}

export async function updateRatings(ratings) {
    const db = await readDB()
    if (!db) return false
    return writeDB({ ...db, ratings })
}
