import StableHashMap "mo:stablehashmap/ClassStableHashMap";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Charity "../CharityCanister/charity";
import Cycles "mo:base/ExperimentalCycles";
import User "../UserCanister/user";
import Result "mo:base/Result";

persistent actor Dove{

  type CharityCanisterV1 = {
    name: Text;
    btcAddress: Text;
    description: Text;
    websiteLink: Text;
    canisterId: Principal;
  };

  type CharityCanister = {
    #v1: CharityCanisterV1;
  };

  stable var charityId : Nat = 0;

  stable var userCanisterProps : ?StableHashMap.HashTableProps<Principal,Principal> = null; 
  stable var charityCanisterProps : ?StableHashMap.HashTableProps<Nat, CharityCanister> = null;

  transient var mapOfUserCanisters = StableHashMap.StableHashMap<Principal, Principal>(1,Principal.equal, Principal.hash);
  transient var mapOfCharityCanisters = StableHashMap.StableHashMap<Nat, CharityCanister>(1, Nat.equal, Hash.hash);

  let ADMIN_PRINCIPAL : Text = "dlaqj-ynpiy-r5z6i-u3sja-m67vi-sptrs-bm6dn-wslpi-vgby5-sdsl7-mae";


  public shared(msg) func createUserCanister(userPrincipal: Principal) : async Text{
     if(Principal.equal(msg.caller, Principal.fromActor(Dove)) or Principal.equal(msg.caller, Principal.fromText(ADMIN_PRINCIPAL))){
        let userCanister = await (with cycles = 1_000_000_000_000) User.UserCanister(userPrincipal, Principal.fromActor(Dove));
        let userCanisterId = Principal.fromActor(userCanister);
        mapOfUserCanisters.put(userPrincipal, userCanisterId);
        return Principal.toText(userCanisterId);
     } else {
        return "Unauthorized to create canister";
     }
  };

  public shared(msg) func resetUserCanister() : async Text{
    if(Principal.equal(msg.caller, Principal.fromText(ADMIN_PRINCIPAL))){
       mapOfUserCanisters := StableHashMap.StableHashMap<Principal, Principal>(1, Principal.equal, Principal.hash);
       mapOfCharityCanisters := StableHashMap.StableHashMap<Nat, CharityCanister>(1,Nat.equal, Hash.hash);
       return "Success";
    } else{
      return "Unauthorized";
    }
  };

  public shared(msg) func getUserCanister() : async Text{
      switch(mapOfUserCanisters.get(msg.caller)){
        case(null){
           let newUserCanisterId : Text = await createUserCanister(msg.caller);
           return newUserCanisterId;
        };
        case(?userCanisterId){
            return Principal.toText(userCanisterId);
        }
      };
  }; 

  public query func getCharityCanister(name: Text) : async Result.Result<Principal, Text>{
    for((id, #v1(charityCanister)) in mapOfCharityCanisters.entries()){
      if(charityCanister.name == name){
        return #ok(charityCanister.canisterId)
      };
    };
    return #err("No charity canister found");
  };

  public shared(msg) func addCharityCanister(nameVal: Text, btcAddressVal: Text, descriptionVal: Text, websiteLinkVal: Text) : async Text{
    if(Principal.equal(msg.caller, Principal.fromText(ADMIN_PRINCIPAL))){
       let newCharityCanister = await (with cycles = 1_000_000_000_000) Charity.CharityCanister(nameVal, btcAddressVal, descriptionVal, websiteLinkVal);
       let newCharityCanisterId = Principal.fromActor(newCharityCanister);
       let newCharity : CharityCanisterV1 = {
          name=nameVal;
          btcAddress=btcAddressVal;
          description=descriptionVal;
          websiteLink=websiteLinkVal;
          canisterId=newCharityCanisterId;
       };

       mapOfCharityCanisters.put(charityId, #v1(newCharity));
       charityId += 1;
       return "Charity Canister Created "#" "#Principal.toText(newCharityCanisterId);
    } else {
      return "Unauthorized";
    }
  };

  system func preupgrade() {
    userCanisterProps := ?mapOfUserCanisters.exportProps();
    charityCanisterProps :=?mapOfCharityCanisters.exportProps();
  };

  system func postupgrade(){
    switch(userCanisterProps){
      case(null){};
      case(?props){
        mapOfUserCanisters.importProps(props);
      };
    };

    switch(charityCanisterProps){
      case(null){};
      case(?props){
        mapOfCharityCanisters.importProps(props);
      };
    };

    userCanisterProps := null;
    charityCanisterProps := null;
  }

};
