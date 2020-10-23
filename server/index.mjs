import * as alt from 'alt-server';

const carrying = {};    // key carrier, value carried

alt.onClient("Server:Carry:CarryPlayer", (player, targetID) => {
    carryPlayer(player,targetID);
})

alt.onClient("Server:Carry:CarryPlayer:Arrested", (player, targetID) => {
    carryPlayerArrested(player,targetID);
})

alt.onClient("Server:Carry:ReleasePlayer", (player) => {
    releasePlayer(player);
})

alt.on("playerDeath", (victim, killer, weaponHash) => {
    const hit0 = carrying[victim.id];
    if(hit0 != undefined && hit0 != null){
        releasePlayer(victim);
        delete carrying[victim.id];
    }
    if(getValuesOfDict(carrying).indexOf(victim.id) != -1){
        const carrierID = getKeyByValue(carrying, victim.id);
        releasePlayer(alt.Player.getByID(carrierID));
        delete carrying[carrierID];
    }
})

alt.on("playerDisconnect", (player, reason) => {
    const hit0 = carrying[player.id];
    if(hit0 != undefined && hit0 != null){
        releasePlayer(player);
        delete carrying[player.id];
    }
    if(getValuesOfDict(carrying).indexOf(player.id) != -1){
        const carrierID = getKeyByValue(carrying, player.id);
        releasePlayer(alt.Player.getByID(carrierID));
        delete carrying[carrierID];
    }
})

function carryPlayer(player, targetID){
    if(!player.hasMeta("Client:Carry:IsDead") || !player.getMeta("Client:Carry:IsDead")){return;}
    // if(player.health <= 100){return;} TODO metacheck
    if(getValuesOfDict(carrying).indexOf(player) != -1){return;}
    if(carrying[player.id] != undefined){return;}
    const target = alt.Player.getByID(targetID);
    if(target == null){return;}
    alt.emitClient(player, "Client:Carry:CarryPlayer", player.id, targetID);
    alt.emitClient(target, "Client:Carry:GetCarried", player.id);
    carrying[player.id] = targetID;
}

function carryPlayerArrested(player, targetID){
    if(getValuesOfDict(carrying).indexOf(player) != -1){return;}
    if(carrying[player.id] != undefined){return;}
    const target = alt.Player.getByID(targetID);
    if(target == null){return;}
    alt.emitClient(player, "Client:Carry:CarryPlayerArrested", player.id, targetID);
    alt.emitClient(target, "Client:Carry:GetCarriedArrested", player.id);
    carrying[player.id] = targetID;
}

function releasePlayer(player){
    const targetID = carrying[player.id];
    if(targetID == undefined || targetID == null){return;}
    alt.emitClient(player, "Client:Carry:ReleasePlayer", targetID);
    const target = alt.Player.getByID(targetID);
    delete carrying[player.id];
    if(target == null){return;}
    alt.emitClient(target, "Client:Carry:GetReleased");
    alt.emitClient(null, "Client:Carry:ResetCollide", targetID);
    target.pos = new alt.Vector3(target.pos.x,target.pos.y,target.pos.z+1);
}

// ------------------------------------- Car Interactions -----------------------------------

function getValuesOfDict(dict){
    return Object.keys(dict).map((key) => {
        return dict[key];
    });
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

alt.onClient("Server:Carry:PulledOutOfCar", (player, targetID) => {
    const target = alt.Player.getByID(targetID);
    if(target == null || target == undefined){return;}
    alt.emitClient(target, "Client:Carry:GetPulledOutOfVehicle"); 
});

alt.onClient("Server:Carry:PutIntoCar", (player, vehicleID, seat) => {
    const targetID = carrying[player.id]
    if(targetID == undefined || targetID == null){return;}
    const target = alt.Player.getByID(targetID);
    if(target == undefined || targetID == null){return;}
    releasePlayer(player);
    alt.emitClient(target, "Client:Carry:GetPutIntoVehicle", vehicleID, seat);  
});