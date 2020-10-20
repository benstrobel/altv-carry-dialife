import * as alt from 'alt';
import * as game from 'natives';

game.requestAnimDict("nm");
game.requestAnimDict("missfinale_c2mcs_1");

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

alt.onServer("Client:Carry:InitAction", (carryType) => {
    if(carrying){
        initReleaseCarried();
        return;
    }
    if(carryType == "Dead"){
        initCarryNearestDeadPlayer();
    }
    if(carryType == "Arrested"){
        initCarryNearestArrestedPlayer();
    }
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

function initCarryNearestDeadPlayer(){
    const player = alt.Player.local;
    if(player == null){return;}
    const nearestPlayer = getNearestOtherPlayer(player, 3);
    if(nearestPlayer == null){return;}
    alt.emitServer("Server:Carry:CarryPlayer", nearestPlayer.id);
}

function initCarryNearestArrestedPlayer(){
    const player = alt.Player.local;
    if(player == null){return;}
    const nearestPlayer = getNearestOtherPlayer(player, 3);
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
    game.attachEntityToEntity(target.scriptID, player.scriptID, 0, 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
    carrying = true;
}

function doCarryNearestArrestedPlayer(playerID, targetID){
    const player = alt.Player.getByID(playerID);
    const target = alt.Player.getByID(targetID);
    if(player == null || target == null){return;}
    game.attachEntityToEntity(target.scriptID, player.scriptID, 0, 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
    carrying = true;
}

function doGetCarriedByPlayer(carrierID){
    const player = alt.Player.getByID(carrierID)
    const target = alt.Player.local;
    game.requestAnimDict("nm");
    game.taskPlayAnim(target.scriptID, "nm", "firemans_carry", 8.0, 8.0, 600000, 1, 1.0, 0, 0, 0);
    game.attachEntityToEntity(target.scriptID, player.scriptID, 0, 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
}

function doGetCarriedArrestedByPlayer(carriedID){
    const player = alt.Player.getByID(carrierID)
    const target = alt.Player.local;
    game.attachEntityToEntity(target.scriptID, player.scriptID, 0, 0.25, 0.2, 0.6, 0, 0, 0, false, false, true, 0, true);
}

function releaseCarried(target){
    game.stopAnimTask(alt.Player.local.scriptID, "missfinale_c2mcs_1", "nm", 1);
    game.detachEntity(target.scriptID, true, false);
    carrying = false;
}

function releaseMe(){
    const target = alt.Player.local;
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
    const vehicle = getNearestVehicle(alt.Player.local, 3); // in do: TASK_LEAVE_VEHICLE (16)
    if(vehicle == null || vehicle.speed*3.6 > 5){return;}
    const bfrPed = game.getPedInVehicleSeat(vehicle.scriptID, 4);
    const bflPed = game.getPedInVehicleSeat(vehicle.scriptID, 3);
    const brPed = game.getPedInVehicleSeat(vehicle.scriptID, 2);
    const blPed = game.getPedInVehicleSeat(vehicle.scriptID, 1);
    const frPed = game.getPedInVehicleSeat(vehicle.scriptID, 0);
    const flPed = game.getPedInVehicleSeat(vehicle.scriptID, -1);
    if(notInvalidScriptID(bfrPed)){
        const player = alt.Player.getByScriptID(bfrPed);
        if(player == null || player == undefined){break;}
        alt.emitServer("Server:Carry:PulledOutOfCar", player.id, vehicle.id, 4);
        return;
    }
    if(notInvalidScriptID(bflPed)){
        const player = alt.Player.getByScriptID(bflPed);
        if(player == null || player == undefined){break;}
        alt.emitServer("Server:Carry:PulledOutOfCar", player.id, vehicle.id, 3);
        return;
    }
    if(notInvalidScriptID(brPed)){
        const player = alt.Player.getByScriptID(brPed);
        if(player == null || player == undefined){break;}
        alt.emitServer("Server:Carry:PulledOutOfCar", player.id, vehicle.id, 2);
        return;
    }
    if(notInvalidScriptID(blPed)){
        const player = alt.Player.getByScriptID(blPed);
        if(player == null || player == undefined){break;}
        alt.emitServer("Server:Carry:PulledOutOfCar", player.id, vehicle.id, 1);
        return;
    }
    if(notInvalidScriptID(frPed)){
        const player = alt.Player.getByScriptID(frPed);
        if(player == null || player == undefined){break;}
        alt.emitServer("Server:Carry:PulledOutOfCar", player.id, vehicle.id, 0);
        return;
    }
    if(notInvalidScriptID(flPed)){
        const player = alt.Player.getByScriptID(flPed);
        if(player == null || player == undefined){break;}
        alt.emitServer("Server:Carry:PulledOutOfCar", player.id, vehicle.id, -1);
        return;
    }
}

function initPutIntoCar(){ // sends targetveh, seatnr to server
    if(alt.Player.local.vehcile != null && alt.Player.local.vehcile != undefined){return;}
    const vehicle = getNearestVehicle(alt.Player.local, 3); // in do: SET_PED_INTO_VEHICLE
    if(vehicle == null || vehicle.speed*3.6 > 5){return;}
    const bfrPed = game.getPedInVehicleSeat(vehicle.scriptID, 4);
    const bflPed = game.getPedInVehicleSeat(vehicle.scriptID, 3);
    const brPed = game.getPedInVehicleSeat(vehicle.scriptID, 2);
    const blPed = game.getPedInVehicleSeat(vehicle.scriptID, 1);
    if(notInvalidScriptID(bfrPed)){
        alt.emitServer("Server:Carry:PutIntoCar", vehicle.id, 4);
        return;
    }
    if(notInvalidScriptID(bflPed)){
        alt.emitServer("Server:Carry:PutIntoCar", vehicle.id, 3);
        return;
    }
    if(notInvalidScriptID(brPed)){
        alt.emitServer("Server:Carry:PutIntoCar", vehicle.id, 2);
        return;
    }
    if(notInvalidScriptID(blPed)){
        alt.emitServer("Server:Carry:PutIntoCar", vehicle.id, 1);
        return;
    }
}

function getPulledOutOfCar(){
    game.taskLeaveVehicle(alt.Player.local.scriptID, 16);
    frameWorkNotificationFramework(1, 3000, "Du wurdest aus dem Fahrzeug gezogen.");
}

function getPutIntoCar(vehicleID, seat){
    const vehicle = alt.Vehicle.getByID(vehicleID);
    if(vehicle == null || vehicle == undefined){return;}
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