import React, { FC } from 'react';
import './image.scss'

interface ImageProps {

    /** Size of the image */
    size?: string;

    /** Class of the image */
    className?: string;

    /** Text alternative of the image */
    alt?: string;

    /** Path of the image */
    path: string;

    /** Event on click */
    click?: React.MouseEventHandler<HTMLElement>
}

const Image: FC<ImageProps> = ({size, className = '', path= '', alt= '', click}) => {

    // Get the base url from the env
    const url = `/${path}`;

    return (
        <>
            <img className={`image-style-${size} ${className}`} src={url} alt={alt} onClick={click} />
        </>
    )
}

export default Image;
