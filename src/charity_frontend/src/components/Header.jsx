import React, {Suspense, useEffect, useState} from "react";
import {BrowserRouter, useHistory, Switch, Route} from "react-router-dom";
import {Actor, HttpAgent} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import {idlFactory, canisterId} from "../../../declarations/dove";
import LoginHomePage from "./LoginHomePage";
import CharityHomePage from "./CharityHomePage";
import { Canvas } from "@react-three/fiber";
import LoadingScreen from "./LoadingScreen";
import { Html } from "@react-three/drei";
import Profile from "../Profile";

const isICNetwork = false;

function Header(){

    const [identity,setIdentity] = useState();
    const [principal, setPrincipal] = useState();
    const [agent, setAgent] = useState();
    const [userCanister, setUserCanister] = useState();

    async function handleAuth(userIdentity, principal){

        //localhost = 127.0.0.1, loopback address that sends requests back to computer
        const hostAgent = isICNetwork ? "https://icp-api.io" : "http://localhost:4943";

        const authAgent = await HttpAgent.create({
            identity: userIdentity,
            host: hostAgent,
            shouldFetchRootKey: !isICNetwork
        });

        setAgent(authAgent);
        setIdentity(userIdentity);
        setPrincipal(principal.toString());
        console.log("Setting auth state variables");
        console.log("User identity is:", userIdentity);
        console.log("Principal is:", principal);

        await findCanister(authAgent);
    }

    async function findCanister(authAgent){
        const authDove=Actor.createActor(idlFactory, {
            agent: authAgent,
            canisterId: canisterId
        });

        let userCanisterId = await authDove.getUserCanister();
        setUserCanister(userCanisterId);
        console.log("User canister id is:", userCanisterId);
    }

    useEffect(() => {
    }, [identity, principal, agent])


    const [showUserInfo, setShowUserInfo] = useState(false);

    return (
        <BrowserRouter forceRefresh={true}>
            <Switch>
                <Route exact path="/">
                    {identity && principal ? 
                    <div style={{width: "100%", height: "100vh"}}>
                        <Canvas camera={{position: [0,0,5.5], fov: 45}} className="homepage">
                            <Suspense fallback={<LoadingScreen/>}>
                                <CharityHomePage userPrincipal={principal} agent={agent} />
                            </Suspense>
                            {showUserInfo && <Profile agent={agent} userCanisterId={userCanister} closeProfile={() => setShowUserInfo(false)}/>}
                        </Canvas>
                        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=account_circle" />
                        {!showUserInfo && <div className="user-profile-container">
                        <span className="material-symbols-outlined" onClick={() => setShowUserInfo(true)}>
                            account_circle
                            </span> 
                        </div>}
                    </div>
                     : 
                    <div style={{width: "100%", height: "100vh"}}>
                        <Canvas camera={{position: [0,0,5.5]}} className="homepage">
                            <Suspense fallback={<LoadingScreen/>}>
                                <LoginHomePage onAuth={handleAuth}/>
                            </Suspense>
                            
                        </Canvas>
                     </div>
                     }
                </Route>
            </Switch>
        </BrowserRouter>
    );

}

export default Header;