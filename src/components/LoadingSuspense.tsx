import { Suspense } from "react";
import LoadingIcon from "./LoadingIcon";

// Define the `LoadingSuspense` component
export default function LoadingSuspense({ children }) {
    return (
        <Suspense fallback={<LoadingIcon />}>
            {children}
        </Suspense>
    );
}