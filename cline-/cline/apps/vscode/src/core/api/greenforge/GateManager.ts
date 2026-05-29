import { ClineAsk, ClineSay } from "../../../shared/ExtensionMessage"
import { DebateSessionResult } from "./DebateRound"

export type AskFn = (type: ClineAsk, text?: string, partial?: boolean) => Promise<{ response: string, text?: string, images?: string[] }>
export type SayFn = (type: ClineSay, text?: string, images?: string[], partial?: boolean) => Promise<undefined>

export interface ManagerPreAnalysis {
	manager_confidence: number
	clarification_questions?: string[]
	inferred_scope: string
	underlying_question: string
	estimated_complexity: string
}

export interface Gate1Decision {
	decision: "APPROVE" | "REJECT" | "NEW_ROUND" | "EDIT"
	userNote?: string
}

export class GateManager {
	constructor(private ask: AskFn, private say: SayFn) {}

	// Gate 0: Clarificação Socrática
	async gate0(managerOutput: ManagerPreAnalysis): Promise<string> {
		if (managerOutput.manager_confidence >= 0.85) {
			return managerOutput.inferred_scope
		}
		
		const payload = JSON.stringify(managerOutput)
		const { response, text } = await this.ask("gf_gate_0_clarification", payload)
		
		return text || managerOutput.inferred_scope
	}

	// Gate 1: Approval Card
	async gate1(debateResult: DebateSessionResult): Promise<Gate1Decision> {
		await this.say("gf_debate_status", JSON.stringify({ status: "AWAITING_GATE_1", ...debateResult }))
		
		// Map the last round outputs to a card structure
		const lastRound = debateResult.rounds[debateResult.rounds.length - 1]
		const approvalCard = {
			rounds: debateResult.rounds.length,
			converged: debateResult.converged,
			rationale: lastRound?.proposerOutput?.rationale,
			underlying_question: lastRound?.arbiterOutput?.underlying_question,
			synthesis: lastRound?.arbiterOutput?.synthesis,
		}
		
		const { response, text } = await this.ask("gf_gate_1_approval", JSON.stringify(approvalCard))
		
		let decision: Gate1Decision["decision"] = "APPROVE"
		if (response === "yesButtonClicked") decision = "APPROVE"
		else if (response === "noButtonClicked") decision = "REJECT"
		else if (response === "messageResponse") decision = "EDIT" // User wrote feedback
		
		return { decision, userNote: text }
	}

	// Gate 2: DiffLens (Simplified for MVP, chunks can be approved as a whole)
	async gate2(generatedCode: any): Promise<boolean> {
		const { response } = await this.ask("gf_gate_2_difflens", JSON.stringify(generatedCode))
		return response === "yesButtonClicked"
	}
}
