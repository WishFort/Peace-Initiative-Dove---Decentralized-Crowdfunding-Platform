import React, {useEffect, useState} from "react";
import { Html} from "@react-three/drei";
import { formatSatoshi } from "./components/Carousel/CarouselHorizontal";
import { idlFactory } from "../../declarations/user";
import { Actor } from "@dfinity/agent";

function Profile(props){
    
    const [userBalance, setUserBalance] = useState(0);
    const [fundingAddr, setFundingAddr] = useState("Loading...");
    const [withdrawalAddr, setWithdrawalAddr] = useState("Loading...");
    const [newWithdrawalAddr, setNewWithdrawalAddr] = useState();

    /*useEffect(() => {
        const authUserCanister = Actor.createActor(idlFactory, {
            agent : props.agent,
            canisterId : props.userCanisterId
        });

        async function getUserData(authCanister){
            await getBalance(authCanister);
            await getWithdrawalAddress(authCanister);
            await getFundBTCAddr(authCanister);
        }

        getUserData(authUserCanister);

    }, []);

    async function getBalance(authCanister){
         const {ok:balance, err: errMsg} = authCanister.getBalance();
         if(balance !== undefined){
            setUserBalance(formatSatoshi(Number(balance)));
         } else {
            console.error("Could not get balance from canister:", errMsg);
         }    
    }
    
    async function getWithdrawalAddress(authCanister){
        const withdrawalAddress = authCanister.getWithdrawalAddress();
        setWithdrawalAddr(withdrawalAddress);
    }

    async function getFundBTCAddr(authCanister){
        let fundingAddrInitial = authCanister.getFundingAddress();
        if(fundingAddrInitial == "none"){
            // create btc address
            let btcAddr = await authCanister.createBTCAddress();
            setFundingAddr(btcAddr);
        } else {
            setFundingAddr(fundingAddrInitial);
        }
    }*/

    async function handleConfirm(){
        const authCanister = Actor.createActor(idlFactory, {
            agent:props.agent,
            canisterId:props.userCanisterId
        });
        const result = await authCanister.setWithdrawalAddress(newWithdrawalAddr);
        if(result=="Success"){
            setWithdrawalAddr(newWithdrawalAddr);
            setShowConfirmText(false);
        }else{
            console.error("Result for setting withdrawal address was not in expected form:", result);
        }
    }
    
    const [showConfirmText, setShowConfirmText] = useState(false);
    const [showInput, setShowInput] = useState(false);

    return(
        <Html center>
            <div className={"donate-container"}>
                <div className="charity-raised donation-text-override">User Profile</div>
                <div className="charity-raised donation-text-override">Balance: {formatSatoshi(50_000)}</div>
                <div className={"address"}>
                    <h2>Funding Address:</h2> 
                    <p>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p></div>
                <hr/>
                <div className={"address"}>
                    <h2>Withdrawal Address:</h2> 
                    <p>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                </div>
                {showInput && <input  
                         type="text"
                         className="input-donation"
                         min="1"
                         placeholder="New withdrawal Address"
                         value={newWithdrawalAddr}
                         onChage={(e) => setNewWithdrawalAddr(e.target.value)}
                        />}
                {!showConfirmText && <div className={"donate-button set-button-override"} onClick={() => {
                    if(showInput){
                        showConfirmText(true);
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
    )
}

export default Profile;