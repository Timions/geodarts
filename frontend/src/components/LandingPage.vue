<template>
    <v-app id="inspire">

        <v-content>
            <v-container

                    fluid
            >
                <v-row
                        justify="center"
                >
                    <v-col
                            cols="5"
                            align="center"
                    >
                        <v-img id="logo" src="@/assets/geoDarts.png"></v-img>
                        <v-card class="elevation-12">
                            <v-toolbar
                                    color="primary"
                                    dark
                                    flat
                            >
                                <v-toolbar-title>Neues Spiel</v-toolbar-title>
                            </v-toolbar>
                            <v-row>
                                <GameModeStarter descr="Städte in Deutschland"
                                                 filename="germany_logo.png"></GameModeStarter>

                            </v-row>

                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>

    import GameModeStarter from "./GameModeStarter";

    export default {
        name: 'App',

        components: {
            GameModeStarter
        },

        data: () => ({}),
      created(){
          this.$store.state.playerName=null;
          this.$store.state.roomId=null;
      }
    };

</script>
<style>
    #logo {
        width: 50%;
        margin-bottom: 5%;
    }

</style>


