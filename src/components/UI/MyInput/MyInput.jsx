import React from 'react';
import classes from './MyInput.module.css'

const MyInput = ({children, ...props}) => {
    return (
        <input {...props} className={classes.input} type="text" placeholder={children}/>
    );
};

export default MyInput;