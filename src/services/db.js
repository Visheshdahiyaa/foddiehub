const BIN_ID = '69ee52d436566621a8f3ea3d'
const API_KEY = '$2a$10$56WRy2KByTQuXuvRM9CAwePMqbkhovqA0BhNjkouKsDCU41hH6E8y'
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
    'X-Bin-Versioning': 'false'
})

// Local cache — avoids reading before every write
let cache = null

export async function readDB() {
    try {
        const res = await fetch(`${BASE_URL}/latest`, {
            method: 'GET',
            headers: getHeaders()
        })
        if (!res.ok) {
            console.error('JSONBin read failed:', res.status)
            return null
        }
        const json = await res.json()
        cache = json.record
        return cache
    } catch (e) {
        console.error('JSONBin read error:', e)
        return null
    }
}

export async function writeDB(data) {
    try {
        const res = await fetch(BASE_URL, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        })
        if (!res.ok) {
            console.error('JSONBin write failed:', res.status)
            return false
        }
        cache = data // update local cache after successful write
        return true
    } catch (e) {
        console.error('JSONBin write error:', e)
        return false
    }
}

// Use cache if available, otherwise fetch
async function getDB() {
    if (cache) return cache
    return await readDB()
}

export async function updateUsers(users) {
    const db = await getDB()
    const base = db || { orders: [], ratings: {}, favorites: {} }
    return writeDB({ ...base, users })
}

export async function updateOrders(orders) {
    const db = await getDB()
    const base = db || { users: {}, ratings: {}, favorites: {} }
    return writeDB({ ...base, orders })
}

export async function updateFavorites(userId, favorites) {
    const db = await getDB()
    const base = db || { users: {}, orders: [], ratings: {} }
    return writeDB({ ...base, favorites: { ...(base.favorites || {}), [userId]: favorites } })
}

export async function updateRatings(ratings) {
    const db = await getDB()
    const base = db || { users: {}, orders: [], favorites: {} }
    return writeDB({ ...base, ratings })
}
