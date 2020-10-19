import * as alt from 'alt-server';

const carrying = {};    // key carrier, value carried

alt.onClient("Server:Carry:CarryPlayer", (player, targetID) => {
    carryPlayer(player,targetID);
})

alt.onClient("Server:Carry:ReleasePlayer", (player) => {
    releasePlayer(player);
})

function carryPlayer(player, targetID){
    if(player.health <= 100){return;}
    if(getValuesOfDict(carrying).indexOf(player) != -1){return;}
    if(carrying[player.id] != undefined){return;}
    const target = alt.Player.getByID(targetID);
    if(target == null){return;}
    if(true){// target.health <= 100){
        alt.emitClient(player, "Client:Carry:CarryPlayer", player.id, targetID);
        alt.emitClient(target, "Client:Carry:GetCarried", player.id);
        carrying[player.id, targetID];
    } 
}

function releasePlayer(player){
    const targetID = carrying[player.id];
    if(targetID == undefined || targetID == null){return;}
    alt.emitClient(player, "Client:Carry:ReleasePlayer", targetID);
    const target = alt.Player.getByID(targetID);
    delete carrying[player.id];
    if(target == null){return;}
    alt.emitClient(target, "Client:Carry:GetReleased");
}

function getValuesOfDict(dict){
    return Object.keys(dict).map((key) => {
        return dict[key];
    });
}