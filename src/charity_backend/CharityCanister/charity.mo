import StableHashMap "mo:stablehashmap/ClassStableHashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import lckBTCLedger "canister:icrc1_ledger";
import lckBTCMinter "canister:ckbtc_minter";

persistent actor class CharityCanister(name: Text, btcAddress: Text, description: Text, websiteLink: Text) = this {
    

    stable var charityGoal : Nat = 1_000_000; 
    
    stable var donorId : Nat = 0;

    stable var donorProps : ?StableHashMap.HashTableProps<Nat, Principal> = null;

    transient var mapOfDonors = StableHashMap.StableHashMap<Nat, Principal>(1, Nat.equal, Hash.hash); 
    
    type Subaccount = Blob;
    type Account = {
        owner: Principal;
        subaccount: ?Subaccount;
    };

    public shared(msg) func getBalance() : async Result.Result<Nat, Text> {
        try{
            let userAccount : Account = {
                owner=Principal.fromActor(this);
                subaccount=null;
            };

            

            return #ok(await lckBTCLedger.icrc1_balance_of(userAccount));
        } catch(err){
            return #err(Error.message(err));
        }
    };

    public shared(msg) func addDonor() : async Text{
        mapOfDonors.put(donorId, msg.caller);
        donorId += 1;
        return "Successfully added Donor";
    };

    public shared(msg) func updateBalance() : async Text{
        switch(await getBalance()){
            case(#ok(balance)){
                if(balance >= charityGoal){
                    let resultRedistribute = await redistributeFunds(balance);
                    let resultWithdraw = await withdraw();
                    return "Update of Balance Possible Success: Withdraw:" # " Redistribute: " # resultRedistribute;
                } else {
                    return "Not time yet for redistribution and withdrawal";
                }
            };
            case(#err(error)){
                return debug_show(error)
            }
        }
    };

    private func withdraw() : async Text{
        let lckBTCMinterPrincipal = "mqygn-kiaaa-aaaar-qaadq-cai";
        let balance : Nat = switch(await getBalance()){
            case(#err(e)){
                return "Error can not withdraw getBalance() failed:" # debug_show(e);
            };
            case(#ok(balanceVal)){
                balanceVal
            };
        };
        let consumeBalance : Nat = balance - 10;

        let approveArgs = {
            spender = {
            owner = Principal.fromText(lckBTCMinterPrincipal);
            subaccount=null;
        };
        amount = consumeBalance;
        expires_at = ?(Nat64.fromIntWrap(Time.now() + 600_000_000_000)); // 10 min expiration
        expected_allowance = ?0; // what is the last allowance, in this case 0, new allowance will be balance
        memo = null;
        fee=?10;
        from_subaccount = null;
        created_at_time = null;
        };

                // giving permission to spend balance to ckBTC minter for this canister
                let resultApprove = await lckBTCLedger.icrc2_approve(approveArgs); // caller is this UserCanister, spender is ckBTC minter
                switch(resultApprove){
                    case(#Ok(_)){
                        // continue with withdrawal flow
                                let transferResult = await lckBTCMinter.retrieve_btc_with_approval({address=btcAddress;
                                                                                            amount=Nat64.fromNat(consumeBalance);});
                                switch(transferResult){
                                    case(#Ok(status)){
                                        return "Successfully withdrew " # Nat.toText(balance) # " BTC";
                                    };
                                    case(#Err(err)){
                                        return "Error in withdrawing and burning funds in ckBTC Minter: " # debug_show(err);
                                    };
                                };
                        
                    };
                    case(#Err(e)){
                        return "failed to approve withdrawal on ckBTCledger" # debug_show(e);
                    };
                };
    };

    private func redistributeFunds(balance : Nat) : async Text{
        try{
            let entropy = await Random.blob();
            let randomFinite = Random.Finite(entropy);

            var randomIndex : Nat = 0;
            // this may trap if donor count > 255, ideally update to core Random module
            // will be revised in future versions
            switch(randomFinite.range(Nat8.fromNat(mapOfDonors.size()))){
                case(null){};
                case(?randomNum){
                    randomIndex := randomNum % mapOfDonors.size();
                };
            };

            let randomDonor : Principal = switch(mapOfDonors.get(randomIndex)){
                case(null){
                    return "Error could not find valid random index for a donor"
                };
                case(?donor){
                    donor;
                }
            };

             let recipient : Account = {
                owner=randomDonor;
                subaccount=null;
            };

            let amountToRedistribute : Nat = ((balance-10) * 1) / 100;

            let transferArgs = {
                from_subaccount = null;
                to=recipient;
                amount=amountToRedistribute;
                fee=null;
                memo=null;
                created_at_time=null;
            };

            let transferResult = await lckBTCLedger.icrc1_transfer(transferArgs);
            switch(transferResult){
                case(#Ok(blockIndex)){
                        return "Success";
                };
                case(#Err(transferErr)){
                        return "transfer of ckBTC failed";
                };
            }
        } catch (err){
            return Error.message(err);
        }
    };
 
    public query func getCharityName() : async Text{
        return name;
    };

    public query func getDescription() : async Text{
        return description;
    };

    public query func getWebsiteLink() : async Text{
        return websiteLink;
    };

    public query func getCharityGoal() : async Nat {
        return charityGoal;
    };

    system func preupgrade(){
        donorProps := ?mapOfDonors.exportProps();
    };

    system func postupgrade(){
        switch(donorProps){
            case(null){};
            case(?props){
                mapOfDonors.importProps(props);
            }
        };

        donorProps := null;
    };
}