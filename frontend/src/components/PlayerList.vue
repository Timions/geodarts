<template>
    <div>
        <div id="player-list">
            <label>Beigetreten:</label>
            <label> {{numberOfPlayers}} Spieler</label>
            <ul>
                <li v-for="(playerName, index) in names" :key="index">{{playerName}}</li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PlayerList",
        props: ["names", 'numberOfPlayers'],

    }
</script>

<style scoped>
    #player-list {
        border-radius: 2px;
      padding:2%;
    }

    label{
      font-weight: bold;
    }


</style>