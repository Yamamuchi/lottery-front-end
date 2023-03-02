import { useEffect, useState } from "react";

// Keeping a state variable that starts off as false
// set to true once the component has done mounting
// useEffect only runs after the component has been mounted
// so we are guaranteed that setMounted(true) only runs once the 
// component has been mounted. Update the value and return it once mounted.
export function useIsMounted() {
    const [mounted, setMounted] = useState(false);

    // runs once when page first loads by giving it an empty dependency array
    useEffect(() => {
        setMounted(true);
    }, [])

    return mounted;
}