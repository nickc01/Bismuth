import React, { Suspense } from "react";
import "../styles/globals.css"
import { StrictMode } from "react";
import LoadingSuspense from "../src/components/LoadingSuspense";
import UserProfile from "../src/components/UserProfile";

//const UserProfile = React.lazy(() => import("../src/components/UserProfile"));

export default function RootLayout({children} : {children: React.ReactNode}) {
    return (
      <html lang="en">
        <body>
            <StrictMode>
              <div className="corner_user_profile">
                <LoadingSuspense>
                    <UserProfile/>
                </LoadingSuspense>
              </div>
                {children}
            </StrictMode>
        </body>
      </html>
    );
  }
  

export const metadata = {
    title: 'Bismuth',
    description: 'A simple task tracker',
};