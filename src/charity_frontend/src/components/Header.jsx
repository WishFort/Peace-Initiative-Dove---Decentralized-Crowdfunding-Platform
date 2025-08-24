import React, {Suspense, useEffect, useState} from "react";
import {BrowserRouter, useHistory, Switch, Route} from "react-router-dom";
import {HttpAgent} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import LoginHomePage from "./LoginHomePage";
import CharityHomePage from "./CharityHomePage";
import { Canvas } from "@react-three/fiber";
import LoadingScreen from "./LoadingScreen";

const isICNetwork = false;

function Header(){

    const [identity,setIdentity] = useState();
    const [principal, setPrincipal] = useState();
    const [agent, setAgent] = useState();

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
    }

    useEffect(() => {
    }, [identity, principal, agent])


    return (
        <BrowserRouter forceRefresh={true}>
            <Switch>
                <Route exact path="/">
                    {identity && principal ? 
                    <div style={{width: "100%", height: "100vh"}}>
                        <Canvas camera={{position: [0,0,5.5]}} className="homepage">
                            <Suspense fallback={<LoadingScreen/>}>
                                <CharityHomePage userPrincipal={principal} agent={agent} />
                            </Suspense>
                        </Canvas>
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