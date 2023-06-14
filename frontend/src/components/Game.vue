<template>
  <v-app>
    <div id="pre-game-countdown">
      <div id="pre-game-countdown-innner">
        <v-img id="logo" src="@/assets/geoDarts.png" width="20vw"></v-img>
        <label style="background-color: white">Das Spiel beginnt...</label>
        <label>5</label>
      </div>
    </div>
    <div id="game-layout">
        <RankingSection id="ranking-section" :round-scores=roundScores :total-scores=totalScores :round="round" :max-round="maxRound" ></RankingSection>
      <div id="game-main-section">
        <div id="round-header">
        <span id="city-name">Wo liegt {{this.currentCity}}?</span>
        <span id="counter"></span>
        </div>
        <div class="map-container-wrapper">
          <MapDiv ref="mapDiv" :guessing="guessing"></MapDiv>
        </div>
      </div>
        <ChatSection id="chat-section"></ChatSection>
    </div>
  </v-app>


</template>

<script>
import MapDiv from "./MapDiv";
import RankingSection from "./RankingSection";
import ChatSection from "./ChatSection";
import {EventBus} from "../util/eventbus";
import Mixin from "@/mixins/SocketListener";

export default {
  name: "Game",
  components: {ChatSection, RankingSection, MapDiv},
  props: ['test'],
  mixins:[Mixin],
  created(){
    this.$store.state.messages=[];
    this.addSocketListener('startRound', (roundParams) => {
      this.startRound(roundParams.city);
      this.round=roundParams.round+1;
      this.maxRound=roundParams.max_round;
      this.guessing=true;
    });

    this.addSocketListener('showResult', (results) => this.showResults(results));
    this.addSocketListener('roundOver', () => {
      EventBus.$emit('getLngLat');
      this.showRanking=true;
      this.guessing=false;
    });

    this.addSocketListener('gameOver', (results) => {
      this.newRoomId=results.roomId;
      const resultsSorted = results.result.sort((a,b)=>{
        if(a.total>b.total || (a.total===b.total && a.totalDistance < b.totalDistance)){
          return -1;
        }
          return 1;
      })
      this.$router.push({name:"results", params:{"roomId":this.$store.state.roomId, "results":resultsSorted, "newRoomId":this.newRoomId}})
    });
  },
  mounted() {
    const href = window.location.href;
    if (!(this.$store.state.roomToken===href.substring(href.lastIndexOf('/') + 1, href.length))) {
      this.$router.push('/');
    } else{
      this.startPreGameCountdown();
    }


    EventBus.$on('returnLngLat', (marker)=>{
      this.sendMarker(marker);
    })


  },

  methods: {

    sendMarker(marker) {
      const lngLat = marker || null;
      let markerSubmit;

      markerSubmit = {
        lngLat,
        distance: null,
        socketId: this.$socket.id,
      }

      this.$socket.emit("submitMarker", markerSubmit);
    },

    startPreGameCountdown(){
      let countdownValue=5;
      const countdownField=document.getElementById('pre-game-countdown-innner').lastChild;
      countdownField.innerText=countdownValue;
      this.preGameCounterId=setInterval(()=>{
        if(countdownValue>1) {
          countdownValue -= 1;
          countdownField.innerText = countdownValue;
        } else{
          document.getElementById('pre-game-countdown').style.display="none";
          clearInterval(this.preGameCounterId);
        }

      }, 1000);
    },

    startRound(cityName) {
      let city;
      if (cityName.indexOf(',') > -1) {
        city = cityName.substring(0, cityName.indexOf(','));
      } else {
        city = cityName;
      }
      this.currentCity=city;
      let counterValue = 10;

      document.getElementById('counter').innerHTML = counterValue;
      this.counterId = setInterval(() => {
        if(counterValue>=1) {
          counterValue -= 1;
          document.getElementById('counter').innerHTML = counterValue;
        }
        else {
          clearInterval(this.counterId);
        }
      }, 1000);
      EventBus.$emit('clearMarkers');
    },

    showResults(results) {
      EventBus.$emit('showResults', results);
      const _roundScores=[];
      const _totalScores=[];
      for(let result of results[0]){
        let {playername} = result;
        _roundScores.push({distance:Math.round(result.distance), playername, points:result.points});
        _totalScores.push({playername, total:result.total});
      }
      _roundScores.sort((a,b)=>{
        //if one distance is null return the other
        if(a.distance===b.distance){
          return 0;
        }
        if(!a.distance){
          return 1;
        }
        if(!b.distance){
          return -1;
        }
        if(a.distance>b.distance){
          return 1;
        }
        return -1;
      });

      _totalScores.sort((a,b)=>{
        if (a.total > b.total){
          return -1;
        } else if(b.total >a.total){
          return 1;
        }
        return 0;
      })

      const sanitizeDistance=(distance)=>{
        return distance ? distance+"km" : "nicht gesetzt";
      };
      _roundScores.map(e=>{
        e.distance=sanitizeDistance(e.distance);
      });

      this.roundScores=_roundScores;
      this.totalScores=_totalScores;
    },

  },
  data() {
    return {
      counterId: null,
      preGameCounterId:null,
      roundScores:[],
      totalScores:[],
      currentCity:"...",
      guessing:false,
      round:null,
      maxRound:null,
      newRoomId:null,

    }
  },
  beforeRouteLeave(to, from, next) {
    document.getElementById("city-name").innerHTML = '';
    document.getElementById('counter').innerHTML = '';
    clearInterval(this.counterId);
    clearInterval(this.preGameCounterId);

    EventBus.$off();
    if(!(to.name==="results")) {
      this.$store.state.roomToken=null;
      this.$socket.removeAllListeners();
      this.$socket.disconnect();
    }
    next();
  }
}
</script>

<style scoped>

#chat-section{
  width:23vw;
  max-width:23vw;
  height: 65vh;
}

#ranking-section{
  width:26vw;
  height: 65vh;
  max-height: 65vh;
}


#pre-game-countdown{
  color:black;
  background-image: url("../assets/background.jpg");
  background-position: center center;
  font-size: 3em;
  position:absolute;
  width:100vw;
  height: 100vh;
  display:flex;
  justify-content: center;
  align-items: flex-start;
  padding-top:7%;
  z-index:100;
}

#pre-game-countdown-innner{
  background-color: white;
  display:flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width:50vw;
  border:solid #415d68;
  border-radius: 7px;

}

#game-layout {
  width: 100vw;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-image: url("../assets/background.jpg");
  background-position: center center;


}
#round-header{
  margin-top:3%;
  display:flex;
  flex-direction: column;
  align-items: center;
  background-color:white;
}

#game-main-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  width: 49vw;

}

.map-container-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1%;

}

#counter {
  margin-top: 0.2%;
  font-size: 1.1em;
  color:red;
}

#city-name {
  font-size: 1.4em;
}

.hidden {
  display: none;
}
</style>