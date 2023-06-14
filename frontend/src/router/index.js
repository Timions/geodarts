import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from "../components/LandingPage";
import Game from "../components/Game";
import InvitationPage from "../components/InvitationPage";
import Results from "@/components/Results";




Vue.use(Router)

export default new Router({

    routes:[


        {
            path:'/game/*',
            name: 'game',
            component: Game,
        },
        {
            path:'/invitation/:roomId',
            name: 'invitation',
            component: InvitationPage,
        },
        {
            path:'/results/:roomId',
            name: 'results',
            component: Results,
            props:true,
        },
        {
            path:'/',
            name: 'landing',
            component: LandingPage
        },
        {
            path:'/*',
            redirect: "/"
        },
    ],
    mode:"history"
})