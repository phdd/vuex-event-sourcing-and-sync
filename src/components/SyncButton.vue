<template>
    <div>
        <span v-if="syncInProgress">Syncing...</span>
        <button v-else @click="sync">Sync</button>
    </div>
</template>

<script lang="ts">
    import {Component, Inject, Vue} from 'vue-property-decorator';
    import {SyncModule, syncModules} from "@/sync";
    import {modules} from "@/store";

    @Component
    export default class TodoForm extends Vue {

        @Inject('syncModule')
        readonly syncModule!: (() => SyncModule);

        get syncInProgress(): boolean {
            return this.syncModule().syncInProgress;
        }

        sync() {
            syncModules(this.$store, modules);
        }

    }
</script>
