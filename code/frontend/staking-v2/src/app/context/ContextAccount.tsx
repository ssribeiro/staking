import React from 'react';

interface IMyContext {
    onEvent: boolean;
    setOnEvent: (value: boolean) => void;
}
const MyContextAccount = React.createContext<IMyContext>({
    onEvent: false,
    setOnEvent: (value: boolean) => {}
});
export default MyContextAccount;
