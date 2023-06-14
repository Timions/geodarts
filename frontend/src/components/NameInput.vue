<template>
  <div id="name-input-row">
    <input type="text" placeholder="name" id="name-input" v-model="name" v-on:keydown="enter"/>
    <button @click="submitName" :disabled="isDisabled" id="submit-name">Spiel beitreten</button>
  </div>
</template>

<script>
export default {
  name: "NameInput",
  data() {
    return {
      name: "",
    }

  },
  methods: {
    enter(event){
  if(event.key==="Enter") {
    this.submitName();
  }
    },
    submitName() {
      this.$store.state.playerName = this.name;
      this.$socket.emit('joinRoom', {roomId: this.$store.state.roomId, name: this.name});
      this.$emit('nameEntered', this.name);
    }
  },
  computed: {
    isDisabled() {
      return this.name.length < 1;
    }
  }
}
</script>

<style scoped>
#name-input {
  border: solid 1px;
  border-radius: 1px;
  padding: 3px;
}

#submit-name {
  background-color: #a1c7a7;
  margin-left: 8px;
  padding: 3px 5px 3px 5px;
  border: solid 1px;
  border-radius: 2px;
}

#submit-name:disabled {
  background-color: #c7c7c7;
  margin-left: 8px;
  padding: 3px 5px 3px 5px;
  border: solid 1px;
  border-radius: 2px;
  opacity: 0.5;
}
</style>