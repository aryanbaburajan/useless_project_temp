import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"Apex Laps",description:"Race real circuits. Set a time."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
