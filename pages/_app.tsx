import { StrictMode } from "react";
import "../styles/globals.css"

//import localFont from 'next/font/local'

//const coolvetica = localFont({src: "../public/coolvetica.woff2"});

export default function Layout({ Component, pageProps}) {
    return <StrictMode><Component {...pageProps}/></StrictMode>;
}