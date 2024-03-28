

export const hasWindow = () => typeof window !== "undefined"
const storage = (driver) => {
  return {
    get: (key) => {
      if (typeof window === "undefined")
        return null
      const item = driver.getItem(key)
      // if((typeof item === 'undefined') || (item==='undefined'))
        // item = 'null'
      if(!item) return null
      return JSON.parse(item)
    },
    set: (key, value) => {
      if (typeof window === "undefined")
        return 
      
      try {
        // Save to local storage
        if (typeof window !== "undefined")
          driver.setItem(key, 
            JSON.stringify(typeof value === 'undefined' ? null : value));
      } catch (error) {
        console.error(`local_storage_adapter ${key} `, error);
      }
    },
    remove: (key) => {
      if (typeof window !== "undefined")
        driver.removeItem(key)
    }
  }
}

export const LS = storage(hasWindow() ? window.localStorage : undefined)
export const SS = storage(hasWindow() ? window.sessionStorage : undefined)