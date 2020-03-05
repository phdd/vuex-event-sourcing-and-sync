<template>
    <div>
        <span v-if="syncInProgress">Syncing...</span>
        <button v-else @click="sync">Sync</button>
    </div>
</template>

<script lang="ts">
    import {Component, Inject, Vue} from 'vue-property-decorator';
    import {AppModule} from "@/app.module";
    import {modules} from "@/store";
    import {isSyncAdapter, ISyncAdapter} from "@/sync";
    import {getModule} from "vuex-module-decorators";
    import {eventMediator, EventModule, IMutationEvent} from "@/events";
    import groupBy from 'lodash.groupby';

    @Component
    export default class TodoForm extends Vue {

        @Inject('appModule')
        readonly appModule!: (() => AppModule);

        syncInProgress: boolean = false;

        async sync() {
            this.syncInProgress = true;
            eventMediator.pause();

            const events = getModule(EventModule, this.$store);
            const groupedEvents = groupBy(events.events, 'module');
            const jobs: Array<Promise<void>> = [];

            for (const moduleName in modules) {
                const module = getModule(modules[moduleName], this.$store);

                if (isSyncAdapter(module)) {
                    const localVersion = this.appModule().syncTokens[moduleName];

                    jobs.push(this
                        .syncWith(localVersion, module as ISyncAdapter<string>, groupedEvents[moduleName] || [])
                        .then((remoteToken) => {
                            this.appModule().setSyncToken({
                                module: moduleName, syncToken: remoteToken });
                        }));
                }
            }

            await Promise.all(jobs);
            events.flush();
            eventMediator.resume();
            this.syncInProgress = false;
        }

        private async syncWith(localVersion: string, adapter: ISyncAdapter<string>, changelog: IMutationEvent[]) {
            const remoteVersion = await adapter.push({ localVersion, changelog });
            return await adapter.pull(remoteVersion || localVersion);
        }

    }
</script>
