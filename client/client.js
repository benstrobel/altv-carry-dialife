import * as alt from 'alt';
import * as game from 'natives';

game.requestAnimDict("nm");
game.requestAnimDict("missfinale_c2mcs_1");

var carried = false;

alt.everyTick(() => {
    if(carried){
        game.setEntityCollision(alt.Player.local.scriptID, false, false);
    }
})

alt.on('keydown', (key) => {
    if (key === "Z".charCodeAt(0)) {    // TODO 
        if(carrying){
            initReleaseCarried();
        }else{
            initCarryNearestDeadPlayer();
        }
        
    }
});

// ------------------  External Functionality -------------------

alt.onServer("Client:Carry:InitAction", () => {
    if(carrying){
        initReleaseCarried();
        return;
    }
    const nearestPlayer = getNearestOtherPlayer(alt.Player.local, 3);
    if(nearestPlayer == null || nearestPlayer == undefined){return;}
    isArrested(nearestPlayer.id).then((status) => {
        alt.log(`Arrested : ${status}`);
        if(status){
            initCarryNearestArrestedPlayer(nearestPlayer);
        }else{
            initCarryNearestDeadPlayer(nearestPlayer);
        }
    }, () => {}).catch(() => {})
})

alt.onServer("Client:Carry:InitCarryDead", () => {
    initCarryNearestDeadPlayer();
})

alt.onServer("Client:Carry:InitCarryArrested", () => {
    initCarryNearestArrestedPlayer();
})

alt.onServer("Client:Carry:InitRelease", () => {
    initReleaseCarried();
})

alt.onServer("Client:Carry:InitPullOutOfVehicle", () => {
    initPullOutOfCar();
})

alt.onServer("Client:Carry:InitPutIntoVehicle", () => {
    initPutIntoCar();
})

// ------------------  Internal Functionality -------------------

alt.onServer("Client:Carry:ResetCollide", (playerid) => {
    const player = alt.Player.getByID(playerid);
    if(player == null || player == undefined){return;}
    game.setEntityCollision(player.scriptID, true, true);
});

alt.onServer("Client:Carry:GetPulledOutOfVehicle", () => {
    getPulledOutOfCar();
});

alt.onServer("Client:Carry:GetPutIntoVehicle", (vehicleID, seat) => {
    getPutIntoCar(vehicleID, seat);
});

alt.onServer("Client:Carry:CarryPlayer", (playerID, targetID) => {
    doCarryNearestDeadPlayer(playerID, targetID);
});

alt.onServer("Client:Carry:CarryPlayerArrested", (playerID, targetID) => {
    doCarryNearestArrestedPlayer(playerID, targetID);
});

alt.onServer("Client:Carry:GetCarried", (carrierID) => {
    doGetCarriedByPlayer(carrierID);
});

alt.onServer("Client:Carry:GetCarriedArrested", (carrierID) => {
    doGetCarriedArrestedByPlayer(carrierID);
});

alt.onServer("Client:Carry:ReleasePlayer", (carriedID) => {
    releaseCarried(carriedID);
});

alt.onServer("Client:Carry:GetReleased", () => {
    releaseMe();
});

var carrying = false;

function initCarryNearestDeadPlayer(nearestPlayer){
    if(nearestPlayer == null){return;}
    alt.emitServer("Server:Carry:CarryPlayer", nearestPlayer.id);
}

function initCarryNearestArrestedPlayer(nearestPlayer){
    if(nearestPlayer == null){return;}
    alt.emitServer("Server:Carry:CarryPlayer:Arrested", nearestPlayer.id);
}

function initReleaseCarried(){
    alt.emitServer("Server:Carry:ReleasePlayer");
}

function doCarryNearestDeadPlayer(playerID, targetID){
    const player = alt.Player.getByID(playerID);
    const target = alt.Player.getByID(targetID);
    if(player == null || target == null){return;}
    game.requestAnimDict("missfinale_c2mcs_1");
    game.taskPlayAnim(player.scriptID, "missfinale_c2mcs_1", "fin_c2_mcs_1_camman", 8.0, 8.0, 600000, 50, 1.0, 0, 0, 0);
    game.attachEntityToEntity(target.scriptID, player.scriptID, game.getPedBoneIndex(player.scriptID, 0), 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
    carrying = true;
}

function doCarryNearestArrestedPlayer(playerID, targetID){
    carrying = true;
}

function doGetCarriedByPlayer(carrierID){
    const player = alt.Player.getByID(carrierID)
    const target = alt.Player.local;
    carried = true;
    game.requestAnimDict("nm");
    game.taskPlayAnim(target.scriptID, "nm", "firemans_carry", 8.0, 8.0, 600000, 1, 1.0, 0, 0, 0);
    game.attachEntityToEntity(target.scriptID, player.scriptID, game.getPedBoneIndex(player.scriptID, 0), 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
}

function doGetCarriedArrestedByPlayer(carrierID){
    const player = alt.Player.getByID(carrierID)
    const target = alt.Player.local;
    carried = true;
    game.attachEntityToEntity(target.scriptID, player.scriptID, game.getPedBoneIndex(player.scriptID, 0), 0.0, 1.0, 0.0, 0, 0, 0, false, false, true, 0, false);
}

function releaseCarried(carriedID){
    game.stopAnimTask(alt.Player.local.scriptID, "missfinale_c2mcs_1", "fin_c2_mcs_1_camman", 1);
    carrying = false;
}

function releaseMe(){
    carried = false;
    const target = alt.Player.local;
    game.stopAnimTask(target.scriptID, "nm", "firemans_carry", 1);
    game.detachEntity(target.scriptID, true, true);
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

function getNearestVehicle(sourcePlayer, radius){
    var nearestVehicle = null;
    var nearestVehicleDistance = null;
    alt.Vehicle.all.forEach((curr) => {
        const currDist = distance(sourcePlayer.pos, curr.pos);
        if(currDist > radius){
            return;
        }
        if(nearestVehicle == null){
            nearestVehicle = curr;
            nearestVehicleDistance = distance(sourcePlayer.pos, curr.pos);
        }else{
            const currDist = distance(sourcePlayer.pos, curr.pos);
            const isCloser = nearestVehicleDistance > currDist;
            nearestVehicle= isCloser ? curr : nearestVehicle;
            nearestVehicleDistance= isCloser ? currDist : nearestVehicleDistance;
        }
    });
    return nearestVehicle;
}

// ------------------------------------- Car Interactions -----------------------------------

function initPullOutOfCar(){   // sends targetveh, targetID(not script)
    if(alt.Player.local.vehcile != null && alt.Player.local.vehcile != undefined){return;}
    const vehicle = getNearestVehicle(alt.Player.local, 3);
    if(vehicle == null || vehicle.speed*3.6 > 5){return;}
    const maxSeat = game.getVehicleModelNumberOfSeats(vehicle.model)-2; //driver is -1
    for(var currentseat = maxSeat; currentseat >= -1; currentseat--){
        const pedOnSeat = game.getPedInVehicleSeat(vehicle.scriptID, currentseat);
        if(notInvalidScriptID(pedOnSeat)){
            const player = alt.Player.getByScriptID(pedOnSeat);
            alt.emitServer("Server:Carry:PulledOutOfCar", player.id);
            return;
        }
    }
}

function initPutIntoCar(){ // sends targetveh, seatnr to server
    if(alt.Player.local.vehicle != null && alt.Player.local.vehicle != undefined){return;}
    const vehicle = getNearestVehicle(alt.Player.local, 3);
    if(vehicle == null || vehicle.speed*3.6 > 5){return;}
    const maxSeat = game.getVehicleModelNumberOfSeats(vehicle.model)-2; //driver is -1
    for(var currentseat = maxSeat; currentseat > -1; currentseat--){
        const pedOnSeat = game.getPedInVehicleSeat(vehicle.scriptID, currentseat);
        if(!notInvalidScriptID(pedOnSeat)){
            alt.emitServer("Server:Carry:PutIntoCar", vehicle.id, currentseat);
            return;
        }
    }
}

function getPulledOutOfCar(){
    if(alt.Player.local.vehicle == null){return;}
    game.taskLeaveVehicle(alt.Player.local.scriptID, alt.Player.local.vehicle.scriptID, 16);
    frameWorkNotificationFramework(1, 3000, "Du wurdest aus dem Fahrzeug gezogen.");
}

function getPutIntoCar(vehicleID, seat){
    const vehicle = alt.Vehicle.getByID(vehicleID);
    if(vehicle == null || vehicle == undefined){return;}
    game.detachEntity(alt.Player.local.scriptID, true, true);
    game.setPedIntoVehicle(alt.Player.local.scriptID, vehicle.scriptID, seat);
    frameWorkNotificationFramework(1, 3000, "Du wurdest in das Fahrzeug gesetzt.");
}

function notInvalidScriptID(scriptID){
    return scriptID != undefined && scriptID != null && scriptID != -1 && scriptID != 0;
}

// ------------------------------------------ Helper ------------------------------------------

function frameWorkNotificationFramework(typ, duration, msg){
    const type = 1; //1 Info | 2 Success | 3 Warning | 4 Error
    alt.emitServer("Server:Admin:SendNotification", typ, duration, msg);
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

async function isArrested(targetId){
    alt.emitServer("Server:Restrain:IsRestrained", targetId);

    let promise = new Promise((res, rej) => {
        alt.onServer("Client:Restrain:IsRestrained", (status) => {
            res(status);
        });
    });

    var result = await promise;
    return result;
}