/* eslint-disable @typescript-eslint/no-unused-expressions */
/// <reference types="../../worker-configuration.d.ts" />

import { Agent, callable, getAgentByName } from "agents";

export type HubState = {
    recentProjects: string[];
};

export class Hub extends Agent<Env, HubState> {
    initialState: HubState = {
        recentProjects: []
    };

    onStart() {
        this.sql`CREATE TABLE IF NOT EXISTS projects (
            name TEXT PRIMARY KEY NOT NULL,
            displayName TEXT NOT NULL,
            createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`
    }

    private generateSafeName(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 50); // Limit length
    }

    private async getUniqueName(baseName: string): Promise<string> {
        const safeName = this.generateSafeName(baseName);
        
        // Check if this name exists
        const [existing] = this.sql<{ name: string }>`
            SELECT name FROM projects WHERE name = ${safeName}
        `;
        
        // If it doesn't exist, we can use it
        if (!existing) {
            return safeName;
        }
        
        // Name exists, append a number
        let counter = 2;
        let candidateName = `${safeName}-${counter}`;
        
        while (true) {
            const [exists] = this.sql<{ name: string }>`
                SELECT name FROM projects WHERE name = ${candidateName}
            `;
            
            if (!exists) {
                return candidateName;
            }
            
            counter++;
            candidateName = `${safeName}-${counter}`;
            
            // Safety check to prevent infinite loops
            if (counter > 1000) {
                throw new Error('Unable to generate unique project name');
            }
        }
    }
    
    @callable()
    async createNewProject({name}: {name: string}) {
        // Generate a unique safe name
        const safeName = await this.getUniqueName(name);
        
        // Insert into projects table (createdAt will be set automatically)
        this.sql`
            INSERT INTO projects (name, displayName)
            VALUES (${safeName}, ${name})
        `;
        
        // Get or create the project agent
        const project = await getAgentByName(this.env.Project, safeName);
        await project.setup({displayName: name});
        
        // Update recent projects list
        const recentProjects = [safeName, ...this.state.recentProjects.filter(p => p !== safeName)].slice(0, 10);
        this.setState({ recentProjects });
        
        return safeName;
    }
    
    @callable()
    async getAllProjects() {
        const projects = this.sql<{ name: string; displayName: string; createdAt: string }>`
            SELECT name, displayName, createdAt
            FROM projects
            ORDER BY createdAt DESC
        `;
        
        return Array.from(projects);
    }
    
    @callable()
    async projectExists(name: string): Promise<boolean> {
        const [project] = this.sql<{ name: string }>`
            SELECT name FROM projects WHERE name = ${name}
        `;
        
        return !!project;
    }
}