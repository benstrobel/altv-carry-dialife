import * as alt from 'alt';
import * as game from 'natives';

alt.on('keydown', (key) => {
    if (key === "X".charCodeAt(0)) { 
        const model = 1413662315;
        if (!game.hasModelLoaded(model)){
            game.requestModel(model);
        }
        gamePed = game.createPed(1, model, alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z, 0.0, false, false);
        alt.log(gamePed)
    }
    if (key === "Z".charCodeAt(0)) {
        if(carrying){
            carrying = false;
        }else{
            initCarryNearestDeadPlayer();
        }
        
    }
});

alt.onServer("Client:Carry:CarryPlayer", (playerID, targetID) => {
    doCarryNearestDeadPlayer(playerID, targetID, true);
});

alt.onServer("Client:Carry:GetCarried", (carrierID) => {
    doGetCarriedByPlayer(carrierID);
});

var carrying = false;

function initCarryNearestDeadPlayer(){
    alt.log("test0")
    const player = alt.Player.local;
    if(player == null){return;}
    const nearestPlayer = getNearestOtherPlayer(player, 3);
    if(nearestPlayer == null){return;}
    alt.emitServer("Server:Carry:CarryPlayer", nearestPlayer.id);
}

function doCarryNearestDeadPlayer(playerID, targetID){
    alt.log("test")
    const player = alt.Player.getByID(playerID);
    const target = alt.Player.getByID(targetID);
    if(player == null || target == null){return;}
    game.requestAnimDict("missfinale_c2mcs_1");
    game.taskPlayAnim(player.scriptID, "missfinale_c2mcs_1", "fin_c2_mcs_1_camman", 8.0, 8.0, 600000, 50, 1.0, 0, 0, 0);
    game.attachEntityToEntity(target.scriptID, player.scriptID, 0, 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
    alt.log("test2")
}

function doGetCarriedByPlayer(carrierID){
    const player = alt.Player.getByID(carrierID)
    const target = alt.Player.local;
    game.requestAnimDict("nm");
    game.taskPlayAnim(target.scriptID, "nm", "firemans_carry", 8.0, 8.0, 600000, 1, 1.0, 0, 0, 0);
    game.attachEntityToEntity(target.scriptID, player.scriptID, 0, 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
    alt.log("test2")
}

function releaseCarriedPlayer(player,target){

    game.stopAnimTask(player.scriptID, "missfinale_c2mcs_1", "nm", 1);
    game.stopAnimTask(target.scriptID, "fin_c2_mcs_1_camma", "firemans_carry", 1);
    game.detachEntity(target.scriptID, true, false);
}

function getNearestOtherPlayer(sourcePlayer, radius){
    var nearestOtherPlayer = null;
    var nearestOtherPlayerDistance = null;
    alt.Player.all.forEach((curr) => {
        if(curr.id != sourcePlayer.id){
            const currDist = distance(sourcePlayer.pos, curr.pos);
            if(currDist > radius){
                return;
            }
            if(nearestOtherPlayer == null){
                nearestOtherPlayer = curr;
                nearestOtherPlayerDistance = distance(sourcePlayer.pos, curr.pos);
            }else{
                const currDist = distance(sourcePlayer.pos, curr.pos);
                const isCloser = nearestOtherPlayerDistance > currDist;
                nearestOtherPlayer= isCloser ? curr : nearestOtherPlayer;
                nearestOtherPlayerDistance= isCloser ? currDist : nearestOtherPlayerDistance;
            }
        }
    });
    return nearestOtherPlayer;
}

function requestAnimDictPromise(dict,dict2) {
    game.requestAnimDict(dict);
    game.requestAnimDict(dict2);
    return new Promise((resolve, reject) => {
        let check = alt.setInterval(() => {

            if(game.hasAnimDictLoaded(dict) && game.hasAnimDictLoaded(dict2))
            {
                alt.clearInterval(check);
                resolve(true);
            } else {
            }
        },(5));
    });
}

function distance(vector0, vector1){
    var sum = 0;
    sum += difference(vector0.x,vector1.x);
    sum += difference(vector0.y,vector1.y);
    sum += difference(vector0.z,vector1.z);
    return sum;
}

function difference(number0, number1){
    return number0 > number1 ? Math.abs(number0-number1) : Math.abs(number1-number0);
}