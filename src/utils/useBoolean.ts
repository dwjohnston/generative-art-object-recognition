import { useCallback, useState } from "react";

export function useBoolean(initialValue: boolean) {

    const [value, setValue] = useState(initialValue); 

    const toggle = useCallback(() => {
        setValue((v) => !v); 
    }, [setValue]); 

    return [value, toggle, setValue]
}