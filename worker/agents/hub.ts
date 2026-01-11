import { Agent, callable, getAgentByName } from "agents";
import { env } from "cloudflare:workers";

export type HubState = {
    recentProjects: string[];
};

export class Hub extends Agent<Env, HubState> {
    
    @callable()
    async createNewProject({name}: {name: string}) {
        const safeName = name;
        const project = await getAgentByName(env.Project, safeName);
        await project.setup({displayName: name})
        return safeName;
    }
}