<template>
  <div>
  <div id="chat-section-outer-container">
        <span id="chat-header">Chat
        </span>
    <div id="chat">
      <div id="chat-table-box">
        <table id="chat-table">
          <tr v-for="messageObject in messages" :key="messages.indexOf(messageObject)">
            <td class="chat-message-playername">{{ messageObject.playername }}:</td>
            <td class="chat-message-text">{{ messageObject.message }}</td>
          </tr>
        </table>
      </div>
      <input type="text" placeholder="Nachricht" id="message-input" v-on:keydown="sendChatMessage"
             v-model="messageInput" autofocus>
    </div>

  </div>
  </div>
</template>

<script>
import SocketListener from "@/mixins/SocketListener";

export default {
  name: "ChatSection",
  mixins: [SocketListener],
  created() {
    this.$socket.off("receiveMsg");
    this.addSocketListener("receiveMsg", (receiveMsg) => this.addChatMessage(receiveMsg));
  },
  methods: {
    sendChatMessage(event) {
      if (event.key === "Enter") {
        this.$socket.emit('sendMsg', this.messageInput);
        this.messageInput = "";
      }
    },
    addChatMessage: function (receiveMsg) {
      this.$store.state.messages.push({playername: receiveMsg.playername, message: receiveMsg.msg});
      this.messages = this.$store.state.messages;
      setTimeout(() => {
        const allMessages = document.getElementById('chat-table').childNodes;
        if (allMessages.length > 0) {
          allMessages[allMessages.length - 1].scrollIntoView();
        }
      }, 0);
    },


  },
  data() {
    return {
      messageInput: "",
      messages: this.$store.state.messages,

    }
  }
}
</script>

<style scoped>
#chat-section-outer-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3%;


  height: 100%;
  max-height: 100%;

}

#chat-header {
  font-weight: bold;
}

#chat {
  background-color:white;
  height: 95%;
  max-height: 95%;
  border: solid #415d68;
  box-shadow: 1px 1px grey;
  border-radius: 2px;
  margin-bottom: 1%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

}

.chat-message-playername {

}


#message-input {
  border: solid 1px grey;
  padding: 5px;
  border-radius: 1px;
  margin: 2px;
  width: 99%;
}

#chat-table-box {
  max-height: 90%;
  overflow: auto;
  padding-left:2%;
}

#chat-table {
  width: 100%;
  font-size: medium;
}

#chat-table tr {
  margin-top: 100px;
}

#chat-table td {
  padding-top: 5px;
}

.chat-message-playername {
  font-weight: bold;
  margin-right: 3%;
  white-space: nowrap;
  vertical-align: top;
  padding-right: 2%;
  width: 35%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-message-text {
  vertical-align: bottom;
  padding-right: 4%;
  max-width: 0;
  text-overflow: ellipsis;
}
</style>