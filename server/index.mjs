import * as alt from 'alt-server';

alt.onClient("Server:Carry:CarryPlayer", (player, targetID) => {
    const target = alt.Player.getByID(targetID);
    if(target == null){return;}
    if(true){// target.health <= 100){
        alt.emitClient(player, "Client:Carry:CarryPlayer", player.id, targetID);
        alt.emitClient(target, "Client:Carry:GetCarried", player.id);
        alt.log("test1")
    }
})