import React, {useEffect, useState} from "react";
import {AuthClient} from "@dfinity/auth-client";
import { propTypes } from "react-bootstrap/esm/Image";

const isICNetwork = false;

let IDENTITY_PROVIDER = isICNetwork ? "https://id.ai/" : 'http://umunu-kh777-77774-qaaca-cai.localhost:4943';


function LoginButton(props){ 

    async function handleAuth(authCli){
        const userIdentity = authCli.getIdentity();
        const principal = userIdentity.getPrincipal();

        console.log("Calling onAuth");
        await props.onAuth(userIdentity, principal);
    }

    async function Login(){
        const authClient = await AuthClient.create();

        try{
            if(await authClient.isAuthenticated()){
                await handleAuth(authClient);
            } else {
                await authClient.login({
                    identityProvider : IDENTITY_PROVIDER,
                    onSuccess : async () => {
                        await handleAuth(authClient);
                    }
                });
            }
        } catch(err){
            console.log("Login Error");
        }
    }

    return (
    <button onClick={Login} className="login-btn">
        <div className="login-btn-text">Login with Internet Identity</div>
    </button>
    );
};

export default LoginButton;