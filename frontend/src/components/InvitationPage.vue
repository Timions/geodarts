<template>
  <v-app>
    <v-container class="fill-height" fluid id="outer-container">
      <v-row
          align="center"
          justify="center">
        <div class="column">
          <div id="center-card">
            <div class="link-container">
              <p>Schicke den folgenden Link an Freunde, um sie zum Spiel einzuladen!</p>
              <UrlBox :url="link"></UrlBox>
            </div>
            <NameInput v-if="!(this.$store.state.playerName ||nameEntered)" ref="nameInput"
                       @nameEntered="submitName"></NameInput>
            <v-btn v-else outlined id="start-button" @click="startGame">Spiel starten
            </v-btn>
          </div>
          <PlayerList v-if="numberOfPlayers>0" id="players" :names="playerNames"
                      :number-of-players="numberOfPlayers"></PlayerList>
        </div>

      </v-row>

    </v-container>
  </v-app>
</template>

<script>
import UrlBox from "./UrlBox";
import NameInput from "./NameInput";
import PlayerList from "./PlayerList";
import SocketListener from "@/mixins/SocketListener";

export default {
  name: "InvitationPage",
  props: ["playerName"],
  components: {PlayerList, NameInput, UrlBox},
  mixins: [SocketListener],
  methods: {
    startGame() {
      this.$socket.emit("startGame");
    },
    submitName(name) {
      this.nameEntered = true;
      this.$store.state.playerName = name;
    }
  },
  mounted() {
    const href = window.location.href;
    this.$store.state.roomId = href.substring(href.lastIndexOf('/') + 1, href.length);
    this.addSocketListener('gameStarted', () => {
      this.$store.state.roomToken = this.$store.state.roomId;
      this.$router.replace('/game/' + this.$store.state.roomId);
    });
    this.addSocketListener('playerUpdate', (players) => {
      this.numberOfPlayers = players.length;
      this.playerNames = players.map(p => p.playername);
    })
    this.addSocketListener('err', () => {
      window.location.href = "/"
    });
    const playerName = this.$store.state.playerName
    if (this.$store.state.playerName) {
      this.$socket.emit('joinRoom', {roomId: this.$store.state.roomId, name: playerName});
    }
  },
  data() {

    return {
      link: window.location.href,
      nameEntered: false,
      playerNames: [],
      numberOfPlayers: 0,
    }
  },

}
</script>

<style scoped>
#outer-container {
  background-image:url("../assets/background.jpg");
  background-position: center center;
  align-items: start;
  padding-top: 20vh;
}

.column {
  display: flex;
  flex-direction: column;
}

#players {
  margin-top: 4%;
  background-color: white;
  border: solid 1px;
  border-radius: 7px;
}

#center-card {
  background-color: white;
  padding: 2vw;
  border-radius: 7px;
  border: solid 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: 30vh;
  box-shadow: 2px 2px grey;
}


</style>