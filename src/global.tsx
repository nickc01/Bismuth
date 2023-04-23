import localFont from 'next/font/local'

export const coolvetica = localFont({src: "../public/coolvetica.woff2"});

export interface Project {
    id?: string;
    name: string;
    description: string;
    owner_id: string;
    editor_ids: string[];
}