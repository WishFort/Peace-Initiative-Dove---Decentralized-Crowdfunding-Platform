import StableHashMap "mo:stablehashmap/ClassStableHashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import lckBTCLedger "canister:icrc1_ledger";

persistent actor class CharityCanister(name: Text, btcAddress: Text, description: Text, websiteLink: Text) = this {
    

    stable var charityGoal : Nat = 1_000_000; 

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