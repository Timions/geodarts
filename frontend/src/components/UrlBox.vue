<template>

    <div id="url-field">
        <input class="noselect" type="text" id="url" :value="url" readonly :size="url.length-10">
        <div id="copy-button" title="Link kopieren" @click="CopyToClipboard('copy-button')" >
            <content-copy-icon id="copy-icon" title=""></content-copy-icon>
        </div>
    </div>

</template>

<script>
    import ContentCopyIcon from 'vue-material-design-icons/ContentCopy.vue';

    export default {
        name: "UrlBox",
        props: ["url"],
        components: {ContentCopyIcon},
        methods: {
            CopyToClipboard() {
                const copyText = document.getElementById('url');
                copyText.select();
                copyText.setSelectionRange(0, 99999);
                document.execCommand('copy');
                document.getSelection().empty();
                document.getElementById('copy-button').classList.add('clicked');


            }
        }
    }
</script>

<style scoped>

    #url-field {
        border: solid grey 1px;
        box-shadow: 1px 1px dimgrey;
        border-radius: 2px;
        display: flex;
        flex-direction: row;
        max-width: 70vw;
        align-items: stretch;
        justify-content: center;

    }

    #url {
        padding: 6px 10px 6px 10px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    #copy-icon {
        display: inline-flex;
    }

    #copy-button {
        background-color: #c7c7c7;
        cursor: pointer;
        padding: 0 5px 0 5px;
        display: flex;
        align-items: center;
    }


    #copy-button:hover {
        background-color: darkgrey;
    }
    #copy-button:active {
        margin-top:3px;

    }




</style>