<template>
  <v-app>
    <v-container id="results-background" class="fill-height" fluid style="justify-content: center">
      <div id="final-results-box">
        <h1>Endergebnis</h1>
        <table>
          <tr>
            <th>Platz</th>
            <th>Name</th>
            <th>Gesamtentfernung</th>
            <th>Punkte</th>

          </tr>
          <tr v-for="player of results" :key="player.playername">
            <td class="rank">{{ results.indexOf(player) + 1 }}.</td>
            <td>{{ player.playername }}</td>
            <td class="distance">{{ player.totalDistance }}km</td>
            <td class="points">{{ player.total }}</td>
          </tr>
        </table>
        <v-btn id="new-game-button" @click="newGame" outlined>neues Spiel</v-btn>
      </div>
      <ChatSection id="chat-section"></ChatSection>

    </v-container>
  </v-app>
</template>

<script>
import ChatSection from "@/components/ChatSection";
import Mixin from "@/mixins/SocketListener";

export default {
  name: "Results",
  components: {ChatSection},
  mixins:[Mixin],
  props:["results", "newRoomId"],

  mounted(){
    const href = window.location.href;
    if (!(this.$store.state.roomToken===href.substring(href.lastIndexOf('/') + 1, href.length))) {
      this.$router.push('/');
    }

    this.addSocketListener('roomCreated', this.startRoom);

    this.addSocketListener("checkRoomAnswer", (answer)=>{
      if(answer===2){
        this.$socket.emit('createRoom', {gameType:"de_cities", roomId:this.newRoomId});
      } else if(answer===1){
        this.startRoom({roomId:this.newRoomId});
      }
    })
  },
  data(){
    return{
      playAnother:false,
    }
  },
  methods:{
    newGame(){
      this.playAnother=true;
      this.$socket.emit("checkRoom", this.newRoomId);
    },
    startRoom(data){
      this.$store.state.roomId=data.roomId;
      this.$router.replace({name:'invitation', params:{roomId:data.roomId}});
    },
  },
  beforeRouteLeave(to, from, next) {
      this.$store.state.roomToken=null;
      this.$socket.removeAllListeners();
      if(!this.playAnother) {
        this.$socket.disconnect();
      }
    next();
  }
}
</script>

<style scoped>

#results-background{
  background-image:url("../assets/background.jpg");
  background-position: center center;

}

#final-results-box {
  border:solid #415d68;
  background-color: white;
  width: 50%;
  height: 50%;
  padding: 10px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

.rank {
  width: 10%;
}

.distance {
  width: 25%;
}

.points {
  width: 10%;
}

td {
  text-align: center;
  border: solid 1px;
}

th {
  border-bottom: solid 1px;

  text-align: center;
}

#new-game-button{
  margin-top:4%;
}

#chat-section{
  width: 23vw;
  height: 60vh;
}

</style>