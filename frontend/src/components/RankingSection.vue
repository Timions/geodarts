<template>
  <div>
  <div id="ranking-section-outer">
    <span id="round-counter">Runde {{ round }}/{{ maxRound }}</span>

    <div id="ranking-section-inner">
        <div>
        <span class="table-description">Rundenwertung</span>
        <table id="round-ranking" class="ranking-table">
          <tr>
            <th class="name-column">Spieler</th>
            <th class="distance-column">Entfernung</th>
            <th class="points-column">Punkte</th>

          </tr>
          <tr v-for="item of roundScores" :key=item.playername>
            <td class="name-column">{{ item.playername }}</td>
            <td>{{ item.distance }}</td>
            <td>+{{ item.points }}</td>

          </tr>

        </table>
      </div>
      <div>
        <span class="table-description">Gesamtwertung</span>
        <table id="game-ranking" class="ranking-table ">
          <tr>
            <th colspan="2" class="name-column">Spieler</th>
            <th class="total-column">Gesamtpunktzahl</th>
          </tr>
          <tr v-for="item of totalScores" :key=totalScores.indexOf(item)>
            <td class="rank-column">{{ totalScores.indexOf(item) + 1 }}.</td>
            <td class="name-column">{{ item.playername }}</td>
            <td class="total-column">{{ item.total }}</td>
          </tr>

        </table>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: "RankingSection",
  props: ["roundScores", "totalScores", "round", "maxRound"],
}
</script>

<style scoped>
#ranking-section-outer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 3% 3% 3%;
}

#round-counter {
  font-weight: bold;
  margin-bottom: 2%;
}

#ranking-section-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  border: solid #415d68;
  background-color: white;
  padding: 20px 5px 5px 5px;
  overflow-y: auto;
}


.table-description {
  font-weight: bold;
}

.ranking-table {
  border: 1px solid black;
  border-collapse: collapse;
  overflow: hidden;
  width: 100%;

}

.ranking-table:first-of-type {
  margin-bottom: 20%;
}


.ranking-table td, th {
  border: 1px solid black;
  text-align: center;
}

.name-column {
  max-width: 0;
  width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-left: none !important;
}

.total-column {
  max-width: 0;
  width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-column {
  font-weight: bold;
  border-right: none !important;
}

.white {
  background-color: white;
}

</style>