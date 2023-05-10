import { UserInfo, readUserInfoFromData } from "../global";
import { DisplayWindow } from "./DisplayWindow"
import { ChangeEvent, useEffect, useState } from "react"
import LoadingIcon from "./LoadingIcon";
import Image from "next/image";
import styles from "../../styles/UserProfileWindow.module.css";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase_init";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { buffer } from "stream/consumers";
import { ResizeOptions } from "image-js";

export interface UserProfileWindowProps {
	userID: string,
	onClose: () => void
}

async function ConvertImage(file: File) {
	const bufferPromise = file.arrayBuffer();
	/*if (file.type === "image/jpeg" || file.type === "image/png") {
		return new Uint8Array(await bufferPromise);
	}*/
	const Converter = await import("image-js");

	let image = await Converter.Image.load(await bufferPromise);

	let resizeOptions: ResizeOptions = {
		preserveAspectRatio: true
	}

	if (image.width >= image.height) {
		resizeOptions.width = 800;
	}
	else {
		resizeOptions.height = 800;
	}

	image = image.resize(resizeOptions);

	return image.toBuffer({format: "jpeg"});
}


export default function UserProfileWindow({userID, onClose}: UserProfileWindowProps) {
	const [userData, setUserData] = useState(null as UserInfo);
	const [uploading, setUploading] = useState(false);
	useEffect(() => {
		return onSnapshot(doc(db,"users",userID),doc => {
			setUserData(readUserInfoFromData(doc));
			if (uploading) {
				setUploading(false);
			}
		});
	},[]);

	let contentsJSX: JSX.Element = null;

	async function onFileUpload(e: ChangeEvent<HTMLInputElement>) {
		const metadata = {
			contentType: "image/jpeg"
		}
		setUploading(true);

		const fileRef = ref(storage,"Profiles/" + userID);

		uploadBytes(fileRef,await ConvertImage(e.target.files[0]),metadata).then(snapshot => getDownloadURL(fileRef)).then(url => {
			return updateDoc(doc(db, "users", userID), {
				profile_picture: url
			}).catch(error => {
				console.error("Failed to update user document");
				console.error(error);
			});
		}).catch(error => {
			console.error("Failed to upload image");
			console.error(error);
		}).finally(() => {
			setUploading(false);
		});
	}

	let imageJSX: JSX.Element;

	if (uploading || userData == null) {
		imageJSX = <LoadingIcon/>;
	}
	else {
		imageJSX = <Image alt="User Profile Photo" width={200} height={200} src={userData.profile_picture}/>;
	}

	if (userData) {
		contentsJSX = <div className={styles.user_content}>
			<div className={styles.image_container}>
				{imageJSX}
			</div>
			<input onChange={onFileUpload} id="upload_input" hidden style={{visibility: "hidden"}} type="file" accept="image/png"/>
			<button onClick={() => document.getElementById("upload_input").click()}>Upload Profile Photo</button>
		</div>;
	}
	else {
	   contentsJSX = <LoadingIcon/>
	}
	return <DisplayWindow onClose={onClose} title={userData?.display_name ?? ""}>
		{contentsJSX}
	</DisplayWindow>
}