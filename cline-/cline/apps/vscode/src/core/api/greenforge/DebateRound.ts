import { ClineStorageMessage } from "../../../shared/messages/content"
import { ApiHandler } from "../index"
import { GreenForgeAgents } from "./AgentFactory"
import { ARBITER_SYSTEM_PROMPT, CRITIC_SYSTEM_PROMPT, PROPOSER_SYSTEM_PROMPT } from "./RolePrompts"

export interface DebateSessionResult {
	rounds: DebateRoundResult[]
	converged: boolean
}

export interface DebateRoundResult {
	round: number
	proposerOutput: any
	criticOutput: any
	arbiterOutput: any
	converged: boolean
	forcedDecision: boolean
}

// Function to run a single ApiHandler and extract the JSON response
export async function runAgent(
	agentName: string,
	systemPrompt: string,
	messages: ClineStorageMessage[],
	agent: ApiHandler,
	onToken?: (agentId: string, token: string) => void
): Promise<any> {
	const stream = agent.createMessage(systemPrompt, messages)
	let fullText = ""
	for await (const chunk of stream) {
		if (chunk.type === "text") {
			fullText += chunk.text
			onToken?.(agentName, chunk.text)
		}
	}
	
	try {
		// Extract JSON from markdown blocks if needed
		const jsonMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
		const jsonString = jsonMatch ? jsonMatch[1] : fullText
		return JSON.parse(jsonString)
	} catch (e) {
		console.error(`Failed to parse ${agentName} output as JSON:`, fullText)
		return { raw: fullText }
	}
}

export async function runDebateRound(
	round: number,
	taskDescription: string,
	agents: GreenForgeAgents,
	previousRounds: DebateRoundResult[],
	onToken?: (agentId: string, token: string) => void
): Promise<DebateRoundResult> {
	// Build context from previous rounds
	const contextMessages: ClineStorageMessage[] = [
		{
			role: "user",
			ts: Date.now(),
			content: [{ type: "text", text: `Task: ${taskDescription}` }]
		}
	]
	
	if (previousRounds.length > 0) {
		const lastRound = previousRounds[previousRounds.length - 1]
		contextMessages.push({
			role: "user",
			ts: Date.now(),
			content: [{ type: "text", text: `Previous Round Feedback: ${JSON.stringify(lastRound.criticOutput)}` }]
		})
	}

	let proposerOutput, criticOutput

	if (round === 1) {
		// Round 1: PARALELO (Anti-herding)
		[proposerOutput, criticOutput] = await Promise.all([
			runAgent("proposer", PROPOSER_SYSTEM_PROMPT, contextMessages, agents.proposer, onToken),
			runAgent("critic", CRITIC_SYSTEM_PROMPT, contextMessages, agents.critic, onToken)
		])
	} else {
		// Round 2+: SEQUENCIAL (Propositor ajusta, Crítico avalia a nova proposta)
		proposerOutput = await runAgent("proposer", PROPOSER_SYSTEM_PROMPT, contextMessages, agents.proposer, onToken)
		const criticMessages: ClineStorageMessage[] = [
			...contextMessages,
			{
				role: "user",
				ts: Date.now(),
				content: [{ type: "text", text: `New Proposal: ${JSON.stringify(proposerOutput)}` }]
			}
		]
		criticOutput = await runAgent("critic", CRITIC_SYSTEM_PROMPT, criticMessages, agents.critic, onToken)
	}

	// Arbiter phase
	const arbiterMessages: ClineStorageMessage[] = [
		...contextMessages,
		{
			role: "user",
			ts: Date.now(),
			content: [{ type: "text", text: `Proposal: ${JSON.stringify(proposerOutput)}\n\nCritique: ${JSON.stringify(criticOutput)}` }]
		}
	]
	const arbiterOutput = await runAgent("arbiter", ARBITER_SYSTEM_PROMPT, arbiterMessages, agents.arbiter, onToken)

	const converged = arbiterOutput.decision === "CONVERGE" && arbiterOutput.open_high_severity_issues === 0
	
	return {
		round,
		proposerOutput,
		criticOutput,
		arbiterOutput,
		converged,
		forcedDecision: round >= 3 && !converged
	}
}
