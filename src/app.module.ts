import {Module, Mutation, VuexModule} from 'vuex-module-decorators';

@Module({
    namespaced: true,
    name: 'app',
    preserveState: true
})
export class AppModule extends VuexModule {

    syncTokens = {};

    @Mutation setSyncToken(value: { module: string, syncToken: string }) {
        this.syncTokens = { ...this.syncTokens, [value.module]: value.syncToken };
    }

}
