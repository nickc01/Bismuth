import { UserInfo } from "../global";
import { DisplayWindow } from "./DisplayWindow"
import { ChangeEvent, useCallback, useState } from "react"
import LoadingIcon from "./LoadingIcon";
import Image from "next/image";
import styles from "../../styles/UserProfileWindow.module.css";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase_init";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import EditableText from "./EditableText";
import { User } from "firebase/auth";

export const DefaultProfileImage = "https://firebasestorage.googleapis.com/v0/b/bismuth-d26ef.appspot.com/o/Content%2FDefault%20Profile%20Icon.png?alt=media&token=8fe9f35f-8ba7-4064-9264-364afc93fe98";

export interface UserProfileWindowProps {
	user: User,
	userInfo: UserInfo,
	onClose: () => void
}

async function ConvertImage(file: File) {
	const bufferPromise = file.arrayBuffer();

	const imageConverter = await import("image-in-browser");

	let fileBuffer = Buffer.from(await bufferPromise);

	let loadedImage = imageConverter.decodeNamedImage({
		data: fileBuffer,
		name: file.type
	});


	if (loadedImage.width > 800 || loadedImage.height > 800) {
		loadedImage = imageConverter.Transform.copyResize({
			width: loadedImage.width >= loadedImage.height ? 800 : undefined,
			height: loadedImage.height > loadedImage.width ? 800 : undefined,
			image: loadedImage
		})
	}

	return imageConverter.encodeJpg({
		image: loadedImage
	});
}


export default function UserProfileWindow({onClose, user, userInfo}: UserProfileWindowProps) {
	const [uploading, setUploading] = useState(false);

	let contentsJSX: JSX.Element = null;

	const onFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
		const metadata = {
			contentType: "image/jpeg"
		}
		setUploading(true);

		const fileRef = ref(storage, "Profiles/" + user.uid);

		uploadBytes(fileRef, await ConvertImage(e.target.files[0]), metadata).then(_ => getDownloadURL(fileRef)).then(url => {
			return setDoc(doc(db, "users", user.uid), {
				profile_picture: url,
				display_name: userInfo?.display_name ?? user.displayName
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
	}, [user, userInfo]);

	const onDisplayNameUpdate = useCallback((str: string) => {
		setDoc(doc(db, "users", user.uid), {
			profile_picture: userInfo?.profile_picture ?? DefaultProfileImage,
			display_name: str
		}).catch(error => {
			console.error("Failed to update user document");
			console.error(error);
		});
	},[user, userInfo]);

	let imageJSX: JSX.Element;

	if (uploading || userInfo == null) {
		imageJSX = <div style={{ width: 200, height: 200 }}>
			<LoadingIcon />;
		</div>
	}
	else {
		imageJSX = <Image alt="User Profile Photo" width={200} height={200} src={userInfo.profile_picture ?? DefaultProfileImage} />;
	}

	if (userInfo) {
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
	return <DisplayWindow onClose={onClose} title={<EditableText textClass={styles.title_field} onTextUpdate={onDisplayNameUpdate} text={userInfo?.display_name ?? user.displayName} />}>
		{contentsJSX}
	</DisplayWindow>
}