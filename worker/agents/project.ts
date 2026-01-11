import { Agent } from "agents";

const defaultOpencodeConfig = {

};

export type ProjectState = {
    displayName?: string,
    skills: Record<string, string>;
    opencodeConfigJson: string;    
}

export class Project extends Agent<Env, ProjectState> {
    initialState = {
        skills: {
            "app-demo-": "READ SKILL"
        },
        opencodeConfigJson: JSON.stringify(defaultOpencodeConfig)
    }

    async setup({displayName}: {displayName: string}) {
        this.setState({
            ...this.state,
            displayName
        });
    }
}