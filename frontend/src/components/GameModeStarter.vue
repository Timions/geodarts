<template>

<div class="centerContainer">
            <div class="preview_label" @click="createGameRoom()">
                <v-img :src="require('../assets/'+filename)" class="preview-image"/>
                <p class="mode_label font-weight-bold">{{descr}}</p>
            </div>
</div>

</template>

<script>
    import SocketListener from "@/mixins/SocketListener";
    export default {
        props: ['descr', 'filename'],
        name: "GameModeStarter",
      mixins:[SocketListener],

        methods: {
            startRoom(data){
               this.$router.push({name: 'invitation', params:{roomId:data.roomId}});
            },

            createGameRoom: function() {
                this.$socket.emit('createRoom', 'de_cities');
            },

        },
        mounted() {
            this.$socket.connect();
            this.addSocketListener('roomCreated', this.startRoom);

        },

    }
</script>

<style scoped>
    .mode_label {
        color: black;
        margin:0;
        cursor: pointer;

    }
    .preview_label{
        display:flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    .centerContainer{
        display:flex;
        justify-content: center;
        align-items: center;
        width:100%;
        padding: 30px;
    }

    .preview-image{
        max-width:25%;
        max-height: 25%;
        border-radius: 5px;
        cursor: pointer;

    }

</style>