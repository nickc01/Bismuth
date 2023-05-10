import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import styles from "../../styles/EditableText.module.css"

import pencil from "../../public/pencil.svg"



export interface EditableTextProps {
    text: string,
    onTextUpdate?: (str: string) => void,
    textClass?: string,
    multiline?: boolean,
    editable?: boolean,
    sizeLimit?: number
}


function splitByNewLines(input: string, textClass: string): JSX.Element[]  {
    return input.split(/\r?\n/).map((s) => <><p className={textClass}>{s}</p><br /></>);
}



export default function EditableText({ text, onTextUpdate = null, textClass = "", multiline = false, editable = true, sizeLimit = Infinity }: EditableTextProps) {
    const [editing, setEditing] = useState(false);

    const [internalText, setInternalText] = useState(text);

    const inputRef = useRef(null as HTMLElement);


    const onTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length >= sizeLimit) {
            e.target.value = internalText;
        }
        else {
            setInternalText(e.target.value);
        }
    }, [sizeLimit, internalText]);

    const onTextChangeMultiline = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length >= sizeLimit) {
            e.target.value = internalText;
        }
        else {
            setInternalText(e.target.value);
        }
    }, [sizeLimit, internalText]);

    const onUnFocus = useCallback((e: FocusEvent) => {
        if (internalText !== text) {
            onTextUpdate?.(internalText);
            (e.target as HTMLInputElement).scrollTo(0, 0);
        }

        setEditing(false);

    }, [internalText, onTextUpdate]);

    const onEnterPressed = useCallback((e: KeyboardEvent) => {
        if (e.code == "Enter") {
            (e.target as any).blur();
        }
    },[]);

    const onFocus = useCallback((e: FocusEvent) => {
        setEditing(true);
    }, []);

    useMemo(() => {
        setInternalText(text);
    }, [text]);

    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
            (inputRef.current as any).select();
        }
    },[editing]);

    if (editable) {
        if (editing) {
            if (multiline) {
                return <div className={styles.input_container}>
                    <textarea ref={inputRef as any} rows={7} onBlur={onUnFocus as any} className={`${styles.input_field} ${styles.multiline_text_area} ${textClass}`} onChange={onTextChangeMultiline} value={internalText} />
                </div>
            }
            else {
                return <div className={styles.input_container}>
                    <input ref={inputRef as any} onBlur={onUnFocus as any} onKeyDown={onEnterPressed as any} className={`${styles.input_field} ${textClass}`} onChange={onTextChange} value={internalText} type="text"/>
                </div>
            }
        }
        else {
            if (multiline) {
                return <div className={styles.input_container}>
                    <div className={`${styles.text_field} ${textClass}`} onClick={onFocus as any}>{splitByNewLines(internalText, textClass)}</div>
                </div>
            }
            else {
                return <div className={styles.input_container}>
                    <div className={`${styles.text_field} ${styles.multiline_text_field} ${textClass}`} onClick={onFocus as any}><p>{internalText}</p></div>
                </div>
            }
        }
    }
    else {
        return <p>{internalText}</p>
    }
}
//internalText.replace(/(?:\r\n|\r|\n)/g, '</br>')