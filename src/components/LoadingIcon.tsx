import loading from "../../public/loading.svg"
import Image from "next/image";

export interface LoadingIconProps {
    size?: number
}

export default function LoadingIcon({size = 100}: LoadingIconProps) {
    return <div className="loading-icon">
    <Image src={loading} height={size} width={size} alt="Loading Icon"/>
    <style jsx>{`
        .loading-icon {
            margin: auto;
            color: red;
        }
    `}</style>
</div>
}