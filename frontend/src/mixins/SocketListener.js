export default{
    methods:{
        addSocketListener(event, handler){
            //this.$socket.off(event);
            this.$socket.on(event, handler);
        }
    }
}