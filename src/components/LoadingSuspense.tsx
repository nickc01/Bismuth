import { Suspense } from "react";
import LoadingIcon from "./LoadingIcon";




export default function LoadingSuspense({children}) {
    return <Suspense fallback={<LoadingIcon/>}>
        {children}
    </Suspense>
}