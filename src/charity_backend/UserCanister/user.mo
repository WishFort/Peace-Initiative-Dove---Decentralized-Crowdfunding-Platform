import Result "mo:base/Result";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import lckBTCLedger "canister:icrc1_ledger";
import lckBTCMinter "canister:ckbtc_minter";

persistent actor class UserCanister(owner: Principal, registry: Principal) = this{

    type Subaccount = Blob;
    type Account = {
        owner: Principal;
        subaccount: ?Subaccount;
    };

    stable var withdrawalAddress : Text = "none";
    stable var fundingAddr : Text = "none";

    public shared(msg) func createBTCAddress() : async Text{
        if(Principal.equal(msg.caller, owner) or Principal.equal(msg.caller, registry)){
            let btcAddress = await lckBTCMinter.get_btc_address({owner=?Principal.fromActor(this);
                                                                subaccount=null; });

            fundingAddr := btcAddress;
            return fundingAddr;
        } else {
            return "Unauthorized";
        }
    };

    public query func getFundingAddress() :  async Text{
        return fundingAddr;
    };

    public query func getWithdrawalAddress() : async Text{
        if(Principal.equal(msg.caller, owner)){
            return withdrawalAddress;
        } else {
            return "Unauthorized";
        }
    };

    public shared(msg) func setWithdrawalAddress(newWithdrawalAddr : Text) : async Text{
        if(Principal.equal(msg.caller, owner)){
            withdrawalAddress := newWithdrawalAddr;
            return "Success";
        } else {
            return "Unauthorized";
        }
    };

    public shared(msg) func getBalance() : async Result.Result<Nat, Text>{
        try{

            let userAccount : Account = {
                owner=Principal.fromActor(this);
                subaccount=null;
            };

            return #ok(await lckBTCLedger.icrc1_balance_of(userAccount));
            

        } catch(err){
            return #err(Error.message(err));
        };
    };

}