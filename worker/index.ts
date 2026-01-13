import { Hono } from 'hono';
import { Hub } from './agents/hub';
import { Project } from './agents/project';
import { agentsMiddleware } from 'hono-agents';

export {Hub, Project};
export {Sandbox} from "@cloudflare/sandbox";


const app = new Hono<{ Bindings: Env }>();

app.use("*", agentsMiddleware());

export default app; 