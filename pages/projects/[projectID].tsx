import { useRouter } from "next/router"




export default function LoadedProjectPage() {
    const router = useRouter();

    const {projectID} = router.query;

    return <h1>{projectID}</h1>
}