import React, {useEffect, useState} from "react";
import { Html} from "@react-three/drei";
import { formatSatoshi } from "./Carousel/CarouselHorizontal";
import { idlFactory } from "../../../declarations/user";
import { Actor } from "@dfinity/agent";

function Profile(props){
    
    const [userBalance, setUserBalance] = useState(0);
    const [fundingAddr, setFundingAddr] = useState("Loading...");
    const [withdrawalAddr, setWithdrawalAddr] = useState("Loading...");
    const [newWithdrawalAddr, setNewWithdrawalAddr] = useState("");
    const [loaderHidden, setLoaderHidden] = useState(true);

    useEffect(() => {
        const authUserCanister = Actor.createActor(idlFactory, {
            agent : props.agent,
            canisterId : props.userCanisterId
        });
        console.log("Auth user canister is:", authUserCanister);

        async function getUserData(authCanister){
            await getBalance(authCanister);
            await getWithdrawalAddress(authCanister);
            await getFundBTCAddr(authCanister);
        }

        getUserData(authUserCanister);

    }, []);

    async function getBalance(authCanister){
       
         const {ok:balance, err: errMsg} = await authCanister.getBalance();
         console.log(balance);
         console.log(errMsg);
         if(balance !== undefined){
            const formattedBalance = formatSatoshi(balance);
            console.log("Formatted balance:", formattedBalance);
            setUserBalance(formatSatoshi(Number(balance)));
         } else {
            console.error("Could not get balance from canister:", errMsg);
         }    
    }
    
    async function getWithdrawalAddress(authCanister){
        try{
            const withdrawalAddress = await authCanister.getWithdrawalAddress();
            console.log("WithdrawalAddress:", withdrawalAddress);
            setWithdrawalAddr(withdrawalAddress);
        } catch(err){
            console.error(err);
        }
        
    }

    async function getFundBTCAddr(authCanister){
        let fundingAddrInitial = await authCanister.getFundingAddress();
        if(fundingAddrInitial == "none"){
            // create btc address
            let btcAddr = await authCanister.createBTCAddress();
            setFundingAddr(btcAddr);
        } else {
            setFundingAddr(fundingAddrInitial);
        }
    }

    async function handleConfirm(){
        setLoaderHidden(false);
        const authCanister = Actor.createActor(idlFactory, {
            agent:props.agent,
            canisterId:props.userCanisterId
        });

        // FUTURE IMPLEMENTATION: should use regex matching for new withdrawal addr to ensure that valid BTC addresses are entered
        const result = await authCanister.setWithdrawalAddress(newWithdrawalAddr);
        if(result=="Success"){
            setWithdrawalAddr(newWithdrawalAddr);
            setShowConfirmText(false);
            setLoaderHidden(true);
            setShowInput(false);
        }else{
            console.error("Result for setting withdrawal address was not in expected form:", result);
        }
    }
    
    const [showConfirmText, setShowConfirmText] = useState(false);
    const [showInput, setShowInput] = useState(false);

    return(
       <>
        <Html center>
            <div className={"donate-container"}>
                <div className="charity-raised donation-text-override">User Profile</div>
                <div className="charity-raised donation-text-override">Balance: {userBalance}</div>
                <div className={"address"}>
                    <h2>Funding Address:</h2> 
                    <p>{fundingAddr}</p></div>
                <hr/>
                <div className={"address"}>
                    <h2>Withdrawal Address:</h2> 
                    <p>{withdrawalAddr}</p>
                </div>
                {showInput && <input  
                         type="text"
                         className="input-donation"
                         min="1"
                         placeholder="New withdrawal Address"
                         value={newWithdrawalAddr}
                         onChange={(e) => setNewWithdrawalAddr(e.target.value)}
                        />}
                {!showConfirmText && <div className={"donate-button set-button-override"} onClick={() => {
                    if(showInput){
                        setShowConfirmText(true);
                    } else {
                        setShowInput(true);
                    }
                }}>Set</div>}
                {showConfirmText && <div className={"donate-button set-button-override"} onClick={handleConfirm}>Confirm</div>}
                
                <div className="return-button-container">
                    <div className={"donate-button return-button-override"} onClick={props.closeProfile}>Return Home</div>
                </div>
                
            </div>
        </Html>
        {!loaderHidden && <Html center>
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
         </Html>}
        </>
    )
}

export default Profile;