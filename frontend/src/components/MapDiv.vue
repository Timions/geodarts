<template>
    <div id="mapContainer">
    </div>


</template>

<script>
    import mapbox from "mapbox-gl/dist/mapbox-gl";
    import {EventBus} from "../util/eventbus";

    export default {
        name: "MapDiv",
        props: ["guessing"],
      created(){
        EventBus.$on('getLngLat', ()=>{
          EventBus.$emit('returnLngLat', this.getLngLat());
        });
        EventBus.$on('clearMarkers', ()=>{
          this.clearTmpMarkers();
        });
        EventBus.$on('showResults', (results)=>{
          this.showResults(results);
        });
      },
        mounted() {


            this.createMap();

            this.map.getCanvas().style = "cursor:default";
            this.map.getCanvas().id = "map-canvas";
            this.map.fitBounds([
                [10, 55],
                [11, 47.2]
            ]);

        },

        methods: {
            clearTmpMarkers() {
                for (let marker of this.tmpMarkers) {
                    marker.remove();
                }
                this.tmpMarkers = [];
            },

            showResults(results) {
                if (this.marker) {
                    this.marker.remove();
                    this.marker = null;
                }

                for (let marker of results[0]) {

                    if (marker.lngLat) {
                        let newTmpMarker = new mapbox.Marker()
                            .setLngLat(marker.lngLat)
                            .setPopup(new mapbox.Popup({offset: 25})
                                .setHTML('<label style="font-weight: bold">' + marker.playername + '</label>'));
                        newTmpMarker.addTo(this.map);
                        newTmpMarker.getElement().style.cursor = "pointer";

                        this.tmpMarkers.push(newTmpMarker);
                    }
                }
                let solutionMarker = new mapbox.Marker({color: 'red'}).setLngLat(results[1]);
                solutionMarker.addTo(this.map);
                this.tmpMarkers.push(solutionMarker);
                solutionMarker.getElement().style.cursor = "default";


            },
            setMarker(e) {
                if (!this.marker) {
                    this.marker = new mapbox.Marker();
                }
                this.marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
                this.marker.addTo(this.map);
            },

            getLngLat() {
                let lngLat;
                if (this.marker && this.marker._lngLat) {
                    lngLat = [this.marker._lngLat.lng, this.marker._lngLat.lat];
                }
                return lngLat;
            },

            createMap() {
                this.map = new mapbox.Map({
                    container: "mapContainer",
                    style: 'mapbox://styles/ji016/ck9ydjwta2a8e1ipej6d6bsf3/draft',
                    accessToken: 'pk.eyJ1IjoiamkwMTYiLCJhIjoiY2s5eWRhOTJ3MDU2MjNncXBnNjN2Y2lkbiJ9.eCET7Z0sCO-ZqAfrtK4WPg',
                    dragPan: false,
                    center: [10.5, 51],
                    zoom: 5.2,
                    scrollZoom: false,
                });


                this.map.on('click', (e) => {
                    if (!this.guessing) {
                        return;
                    }
                    this.setMarker(e);
                    this.$emit('mapClick');
                });

            },

        },
        data() {
            return {
                roundOngoing: false,
                map: {},
                tmpMarkers: [],
                marker: null,
            }
        }
    }

</script>
<style scoped>

    #mapContainer {
        position: absolute;
        width: 45%;
        height: 85%;
    }


    #map {
        position: absolute;
        width: 100%;
    }
</style>